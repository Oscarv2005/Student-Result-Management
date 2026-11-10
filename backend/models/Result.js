const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    marks: { type: Number, required: true, min: 0 },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    addedByName: { type: String, trim: true },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollno: { type: String, required: true, trim: true },
    institution: { type: String, required: true, trim: true },
    batch: { type: String, trim: true }, // class / batch, e.g. "10-A"
    subjects: {
      type: [subjectSchema],
      validate: [(v) => v.length > 0, "Add at least one subject"],
    },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

resultSchema.index({ rollno: 1, institution: 1 }, { unique: true });

module.exports = mongoose.model("Result", resultSchema);