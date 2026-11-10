import { useState } from "react";
import { api, useAuth } from "./api";

const EMPTY = {
  name: "",
  email: "",
  password: "",
  role: "student",
  rollno: "",
  institution: "",
  batch: "",
  teacherCode: "",
};

function Log() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setNotice("");
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const data = await api(isLogin ? "/auth/login" : "/auth/register", {
        method: "POST",
        body: isLogin ? { email: form.email, password: form.password } : form,
      });
      signIn(data);
    } catch (err) {
      if (err.code === "USER_NOT_FOUND") {
        setMode("register");
        setNotice(
          "We couldn't find an account for this email. Please register first.",
        );
      } else if (err.code === "USER_EXISTS") {
        setMode("login");
        setNotice("This email is already registered. Please log in.");
      } else {
        setError(err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <div className="brand brand-lg">
          <span className="brand-mark">R</span>
          Report<span>Manager</span>
        </div>
        <h1>Exam results, in one place.</h1>
        <ul>
          <li>Students: view your result</li>
          <li>Teachers: add and look up results</li>
        </ul>
      </section>

      <section className="auth-panel">
        <form className="card auth-card" onSubmit={submit}>
          <div className="tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={isLogin}
              className={isLogin ? "tab active" : "tab"}
              onClick={() => switchMode("login")}
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={!isLogin}
              className={!isLogin ? "tab active" : "tab"}
              onClick={() => switchMode("register")}
            >
              Register
            </button>
          </div>

          <h2>{isLogin ? "Welcome back" : "Create your account"}</h2>
          <p className="muted">
            {isLogin
              ? "Log in to continue."
              : "New here? Fill in your details to get started."}
          </p>

          {notice && <div className="alert alert-info">{notice}</div>}
          {error && (
            <div className="alert alert-error" role="alert">
              {error}
            </div>
          )}

          {!isLogin && (
            <>
              <div className="segmented" role="radiogroup" aria-label="I am a">
                {["student", "teacher"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={form.role === r}
                    className={form.role === r ? "seg active" : "seg"}
                    onClick={() => setForm({ ...form, role: r })}
                  >
                    {r === "student" ? "I'm a student" : "I'm a teacher"}
                  </button>
                ))}
              </div>

              <label className="field">
                Full name
                <input
                  name="name"
                  value={form.name}
                  onChange={change}
                  required
                />
              </label>
            </>
          )}

          <label className="field">
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={change}
              autoComplete="email"
              required
            />
          </label>

          <label className="field">
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={change}
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={isLogin ? undefined : 6}
              required
            />
          </label>

          {!isLogin && form.role === "student" && (
            <>
              <label className="field">
                Roll no / Reg no
                <input
                  name="rollno"
                  value={form.rollno}
                  onChange={change}
                  required
                />
              </label>
              <label className="field">
                School / University
                <input
                  name="institution"
                  value={form.institution}
                  onChange={change}
                  required
                />
              </label>
              <label className="field">
                Class / Batch
                <input
                  name="batch"
                  value={form.batch}
                  onChange={change}
                  placeholder="e.g. 10-A"
                />
              </label>
            </>
          )}

          {!isLogin && form.role === "teacher" && (
            <label className="field">
              Teacher code
              <input
                name="teacherCode"
                value={form.teacherCode}
                onChange={change}
                placeholder="Given by your administrator"
                required
              />
            </label>
          )}

          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? "Please wait…" : isLogin ? "Log in" : "Create account"}
          </button>

          <p className="switch muted">
            {isLogin ? "New user? " : "Already registered? "}
            <button
              type="button"
              className="link"
              onClick={() => switchMode(isLogin ? "register" : "login")}
            >
              {isLogin ? "Register" : "Log in"}
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}

export default Log;
