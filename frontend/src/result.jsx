import { useEffect, useState } from "react";
import { api, useAuth } from "./api";

const EMPTY_FORM = { name: "", rollno: "", institution: "", batch: "" };

const SUBJECT_OPTIONS = [
  "English",
  "Hindi",
  "Punjabi",
  "Mathematics",
  "Science",
  "Social Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Geography",
  "Economics",
];
const OTHER = "__other__";

const SEARCH_FIELDS = {
  all: ["name", "rollno", "institution", "batch"],
  name: ["name"],
  rollno: ["rollno"],
  institution: ["institution"],
  batch: ["batch"],
};

const SEARCH_LABELS = {
  all: "name, roll no, institution or batch",
  name: "a name",
  rollno: "a roll no",
  institution: "an institution",
  batch: "a class / batch",
};

function Res() {
  const { user } = useAuth();
  const [form, setForm] = useState(EMPTY_FORM);
  const [subjects, setSubjects] = useState([]);
  const [choice, setChoice] = useState("");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [searchBy, setSearchBy] = useState("name");

  // Marks other teachers already saved for this student
  const [existing, setExisting] = useState(null);

  useEffect(() => {
    api("/students")
      .then(setStudents)
      .catch(() => {});
  }, []);

  const loadExisting = async (rollno, institution) => {
    if (!rollno.trim() || !institution.trim()) return setExisting(null);
    try {
      const list = await api(
        `/results/search?${new URLSearchParams({ rollno, institution })}`,
      );
      setExisting(list[0] || null);
    } catch {
      setExisting(null);
    }
  };

  // Look up saved marks whenever roll no + institution are filled in
  useEffect(() => {
    const t = setTimeout(
      () => loadExisting(form.rollno, form.institution),
      400,
    );
    return () => clearTimeout(t);
  }, [form.rollno, form.institution]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const q = query.trim().toLowerCase();
  const matches = q
    ? students
        .filter((s) =>
          SEARCH_FIELDS[searchBy].some((key) =>
            (s[key] || "").toLowerCase().includes(q),
          ),
        )
        .slice(0, 6)
    : [];

  const pickStudent = (s) => {
    setForm({
      name: s.name,
      rollno: s.rollno || "",
      institution: s.institution || "",
      batch: s.batch || "",
    });
    setSubjects([]);
    setQuery("");
  };

  // Subjects another teacher already owns cannot be changed (admins can)
  const locked =
    existing && user.role !== "admin"
      ? existing.subjects
          .filter((s) => String(s.addedBy) !== String(user.id))
          .map((s) => s.subject.toLowerCase())
      : [];

  const addSubject = () => {
    const name = choice === OTHER ? subject.trim() : choice;
    if (!name || marks === "") return;
    if (locked.includes(name.toLowerCase())) {
      setStatus({
        type: "error",
        text: `${name} was entered by another teacher.`,
      });
      return;
    }
    if (subjects.some((s) => s.subject.toLowerCase() === name.toLowerCase())) {
      setStatus({ type: "error", text: `${name} is already added.` });
      return;
    }
    setStatus(null);
    setSubjects([...subjects, { subject: name, marks: Number(marks) }]);
    setChoice("");
    setSubject("");
    setMarks("");
  };

  const removeSubject = (index) =>
    setSubjects(subjects.filter((_, i) => i !== index));

  const onSubjectKey = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSubject();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (subjects.length === 0) {
      setStatus({
        type: "error",
        text: "Add at least one subject before saving.",
      });
      return;
    }
    setSaving(true);
    try {
      await api("/results", { method: "POST", body: { ...form, subjects } });
      await loadExisting(form.rollno, form.institution);
      setSubjects([]);
      setStatus({ type: "success", text: "Marks saved." });
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const total = subjects.reduce((sum, s) => sum + s.marks, 0);

  return (
    <div className="page narrow">
      <h1>Add marks</h1>
      <form className="card stack" onSubmit={submit}>
        {students.length > 0 && (
          <div className="stack">
            <div className="row row-end">
              <label className="field">
                Search by
                <select
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                >
                  <option value="name">Name</option>
                  <option value="batch">Class / Batch</option>
                  <option value="rollno">Roll no</option>
                  <option value="institution">Institution</option>
                  <option value="all">All</option>
                </select>
              </label>
              <label className="field grow">
                Find a registered student (optional)
                <input
                  type="search"
                  value={query}
                  placeholder={`Type ${SEARCH_LABELS[searchBy]}…`}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
            </div>

            {q && matches.length === 0 && (
              <p className="muted">No registered student matches.</p>
            )}
            {matches.length > 0 && (
              <ul className="subject-list">
                {matches.map((s) => (
                  <li key={s.id}>
                    <span>
                      {s.name} · {s.batch ? `${s.batch} · ` : ""}
                      {s.rollno}, {s.institution}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => pickStudent(s)}
                    >
                      Select
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <label className="field">
          Student name
          <input name="name" value={form.name} onChange={change} required />
        </label>
        <div className="row">
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
        </div>
        <label className="field">
          Class / Batch
          <input
            name="batch"
            value={form.batch}
            onChange={change}
            placeholder="e.g. 10-A"
          />
        </label>

        {existing && (
          <div className="alert alert-info">
            <strong>Already entered for {existing.name}:</strong>
            <ul className="subject-list">
              {existing.subjects.map((s) => (
                <li key={s.subject}>
                  <span>
                    {s.subject}
                    {s.addedByName ? ` · ${s.addedByName}` : ""}
                  </span>
                  <span>{s.marks}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <fieldset className="subjects">
          <legend>Your subjects</legend>
          <div className="row row-end">
            <label className="field grow">
              Subject
              <select
                value={choice}
                onChange={(e) => setChoice(e.target.value)}
              >
                <option value="">Select a subject…</option>
                {SUBJECT_OPTIONS.filter(
                  (o) =>
                    !subjects.some((s) => s.subject === o) &&
                    !locked.includes(o.toLowerCase()),
                ).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
                <option value={OTHER}>Other…</option>
              </select>
            </label>
            {choice === OTHER && (
              <label className="field grow">
                Subject name
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  onKeyDown={onSubjectKey}
                  autoFocus
                />
              </label>
            )}
            <label className="field">
              Marks
              <input
                type="number"
                min="0"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                onKeyDown={onSubjectKey}
              />
            </label>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={addSubject}
            >
              Add
            </button>
          </div>

          {subjects.length > 0 && (
            <ul className="subject-list">
              {subjects.map((s, i) => (
                <li key={i}>
                  <span>{s.subject}</span>
                  <span className="subject-end">
                    {s.marks}
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Remove ${s.subject}`}
                      onClick={() => removeSubject(i)}
                    >
                      ×
                    </button>
                  </span>
                </li>
              ))}
              <li className="subject-total">
                <span>Total (this entry)</span>
                <span>{total}</span>
              </li>
            </ul>
          )}
        </fieldset>

        {status && (
          <div
            className={`alert ${status.type === "success" ? "alert-success" : "alert-error"}`}
            role="status"
          >
            {status.text}
          </div>
        )}

        <button className="btn btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save marks"}
        </button>
      </form>
    </div>
  );
}

export default Res;
