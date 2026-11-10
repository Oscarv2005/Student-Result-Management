require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Result = require("./models/Result");

const missingEnv = ["MONGO_URI", "JWT_SECRET"].filter((k) => !process.env[k]);
if (missingEnv.length && require.main === module) {
  console.error(`Missing env vars: ${missingEnv.join(", ")}`);
  process.exit(1);
}

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json());

let connecting;
function connectDB() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!connecting) {
    connecting = mongoose
      .connect(process.env.MONGO_URI)
      .then(seedAdmin)
      .catch((err) => {
        connecting = null;
        throw err;
      });
  }
  return connecting;
}

app.use(async (req, res, next) => {
  if (missingEnv.length)
    return res
      .status(500)
      .json({ error: `Missing environment variables: ${missingEnv.join(", ")}` });
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed:", err.message);
    res.status(500).json({ error: "Database connection failed" });
  }
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
    rollno: { type: String, trim: true },
    institution: { type: String, trim: true },
    batch: { type: String, trim: true },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toPublic = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    rollno: this.rollno,
    institution: this.institution,
    batch: this.batch,
  };
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

const sign = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "Please log in first" });
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ error: "Account no longer exists" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Session expired. Please log in again" });
  }
};

const allow = (...roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ error: "You do not have access to this" });

const exact = { locale: "en", strength: 2 };
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

app.get("/", (req, res) => res.send("Report Manager API"));

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "student",
      rollno,
      institution,
      batch,
      teacherCode,
    } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password are required" });
    if (password.length < 6)
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    if (!["student", "teacher"].includes(role))
      return res.status(400).json({ error: "Invalid role" });

    if (role === "teacher") {
      if (!process.env.TEACHER_CODE || teacherCode !== process.env.TEACHER_CODE)
        return res.status(403).json({ error: "Invalid teacher code" });
    }

    if (role === "student") {
      if (!rollno || !institution)
        return res
          .status(400)
          .json({ error: "Roll no and school/university are required for students" });
      const taken = await User.exists({
        role: "student",
        rollno: rollno.trim(),
        institution: institution.trim(),
      });
      if (taken)
        return res.status(409).json({
          error: "A student account already exists for this roll no and institution",
        });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (await User.exists({ email: normalizedEmail }))
      return res
        .status(409)
        .json({ code: "USER_EXISTS", error: "This email is already registered" });

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
      ...(role === "student" && { rollno, institution, batch }),
    });
    res.status(201).json({ token: sign(user), user: user.toPublic() });
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(409)
        .json({ code: "USER_EXISTS", error: "This email is already registered" });
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+password"
    );
    if (!user)
      return res.status(404).json({
        code: "USER_NOT_FOUND",
        error: "No account found for this email. Please register first.",
      });
    if (!(await user.comparePassword(password)))
      return res.status(401).json({ error: "Incorrect password" });

    res.json({ token: sign(user), user: user.toPublic() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/auth/me", protect, (req, res) => res.json({ user: req.user.toPublic() }));

app.post("/api/results", protect, allow("teacher", "admin"), async (req, res) => {
  try {
    const { name, rollno, institution, batch, subjects } = req.body;
    if (!name || !rollno || !institution)
      return res.status(400).json({ error: "Name, roll no and institution are required" });
    if (!Array.isArray(subjects) || subjects.length === 0)
      return res.status(400).json({ error: "Add at least one subject" });

    const incoming = subjects.map((s) => ({
      subject: s.subject,
      marks: s.marks,
      addedBy: req.user._id,
      addedByName: req.user.name,
    }));

    let result = await Result.findOne({
      rollno: rollno.trim(),
      institution: institution.trim(),
    }).collation(exact);

    if (!result) {
      result = await Result.create({
        name,
        rollno,
        institution,
        batch,
        subjects: incoming,
        addedBy: req.user._id,
      });
      return res.status(201).json(result);
    }

    const isAdmin = req.user.role === "admin";
    const blocked = [];
    for (const s of incoming) {
      const existing = result.subjects.find(
        (x) => x.subject.toLowerCase() === String(s.subject).toLowerCase()
      );
      if (!existing) {
        result.subjects.push(s);
      } else if (isAdmin || String(existing.addedBy) === String(req.user._id)) {
        existing.marks = s.marks;
        existing.addedBy = s.addedBy;
        existing.addedByName = s.addedByName;
      } else {
        blocked.push(
          `${existing.subject} (entered by ${existing.addedByName || "another teacher"})`
        );
      }
    }
    if (blocked.length)
      return res
        .status(409)
        .json({ error: `Already entered by another teacher: ${blocked.join(", ")}` });

    if (batch?.trim()) result.batch = batch.trim();
    await result.save();
    res.json(result);
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(409)
        .json({ error: "Another teacher just saved this student. Please save again." });
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/results/me", protect, allow("student"), async (req, res) => {
  try {
    const result = await Result.findOne({
      rollno: req.user.rollno,
      institution: req.user.institution,
    }).collation(exact);
    if (!result)
      return res.status(404).json({ error: "Your result has not been published yet" });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/results/search", protect, allow("teacher", "admin"), async (req, res) => {
  try {
    const { name, rollno, institution, batch } = req.query;
    const filter = {};
    if (name?.trim()) filter.name = new RegExp(escapeRegex(name.trim()), "i");
    if (rollno?.trim()) filter.rollno = rollno.trim();
    if (institution?.trim()) filter.institution = institution.trim();
    if (batch?.trim()) filter.batch = batch.trim();

    if (Object.keys(filter).length === 0)
      return res
        .status(400)
        .json({ error: "Enter a name, roll no, institution or batch" });

    const results = await Result.find(filter)
      .collation(exact)
      .sort({ name: 1 })
      .limit(20);
    if (results.length === 0) return res.status(404).json({ error: "Result not found" });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/results", protect, allow("admin"), async (req, res) => {
  try {
    res.json(await Result.find().sort({ createdAt: -1 }));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/results/:id", protect, allow("admin"), async (req, res) => {
  try {
    const deleted = await Result.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Result not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/students", protect, allow("teacher", "admin"), async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).sort({ name: 1 });
    res.json(students.map((u) => u.toPublic()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/users", protect, allow("admin"), async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users.map((u) => u.toPublic()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/users/:id/role", protect, allow("admin"), async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "teacher", "admin"].includes(role))
      return res.status(400).json({ error: "Invalid role" });
    if (req.params.id === String(req.user._id))
      return res.status(400).json({ error: "You cannot change your own role" });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.toPublic());
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/users/:id", protect, allow("admin"), async (req, res) => {
  try {
    if (req.params.id === String(req.user._id))
      return res.status(400).json({ error: "You cannot delete your own account" });
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

async function seedAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;
  const email = ADMIN_EMAIL.toLowerCase().trim();
  if (await User.exists({ email })) return;
  await User.create({
    name: ADMIN_NAME || "Administrator",
    email,
    password: ADMIN_PASSWORD,
    role: "admin",
  });
  console.log(`Admin account created: ${email}`);
}

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  connectDB()
    .then(() => {
      console.log("MongoDB connected");
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error("Startup failed:", err.message);
      process.exit(1);
    });
}
