import { useEffect, useState } from "react";
import { api, useAuth } from "./api";

function ResultCard({ result }) {
  const [selected, setSelected] = useState("all");
  const total = result.subjects.reduce((sum, s) => sum + s.marks, 0);
  const visible =
    selected === "all"
      ? result.subjects
      : result.subjects.filter((s) => s.subject === selected);

  return (
    <article className="card result-card">
      <div className="result-head">
        <div>
          <h2>{result.name}</h2>
          <p className="muted">
            Roll no {result.rollno} · {result.institution}
          </p>
        </div>
        <div className="total">
          <span>Total</span>
          <strong>{total}</strong>
        </div>
      </div>
      <label className="field">
        Subject
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="all">All subjects</option>
          {result.subjects.map((s) => (
            <option key={s.subject} value={s.subject}>
              {s.subject}
            </option>
          ))}
        </select>
      </label>
      <ul className="subject-list">
        {visible.map((s, i) => (
          <li key={i}>
            <span>{s.subject}</span>
            <span>{s.marks}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function Report() {
  const { user } = useAuth();
  const isStudent = user.role === "student";

  const [form, setForm] = useState({ name: "", rollno: "", institution: "" });
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isStudent);

  useEffect(() => {
    if (!isStudent) return;
    api("/results/me")
      .then((r) => setResults([r]))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [isStudent]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const search = async (e) => {
    e.preventDefault();
    setError("");
    setResults([]);

    const filled = Object.fromEntries(
      Object.entries(form).filter(([, v]) => v.trim()),
    );
    if (Object.keys(filled).length === 0) {
      setError("Enter a name, roll no or school/university.");
      return;
    }

    setLoading(true);
    try {
      setResults(await api(`/results/search?${new URLSearchParams(filled)}`));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page narrow">
      <h1>{isStudent ? "Your result" : "Find a result"}</h1>

      {!isStudent && (
        <form className="card stack" onSubmit={search}>
          <label className="field">
            Name
            <input
              name="name"
              value={form.name}
              onChange={change}
              placeholder="Student name"
            />
          </label>
          <label className="field">
            Roll no / Reg no
            <input name="rollno" value={form.rollno} onChange={change} />
          </label>
          <label className="field">
            School / University
            <input
              name="institution"
              value={form.institution}
              onChange={change}
            />
          </label>
          <p className="muted">Fill in at least one field.</p>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Searching…" : "Search"}
          </button>
        </form>
      )}

      {isStudent && loading && <p className="muted">Loading your result…</p>}
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      {results.map((r) => (
        <ResultCard key={r._id} result={r} />
      ))}
    </div>
  );
}

export default Report;
