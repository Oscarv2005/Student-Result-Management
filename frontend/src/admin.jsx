import { useEffect, useState } from "react";
import { api, useAuth } from "./api";

function Admin() {
  const { user: me } = useAuth();
  const [tab, setTab] = useState("results");
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api("/results"), api("/users")])
      .then(([r, u]) => {
        setResults(r);
        setUsers(u);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const removeResult = async (id) => {
    if (!window.confirm("Delete this result?")) return;
    setError("");
    try {
      await api(`/results/${id}`, { method: "DELETE" });
      setResults(results.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const changeRole = async (id, role) => {
    setError("");
    try {
      const updated = await api(`/users/${id}/role`, {
        method: "PATCH",
        body: { role },
      });
      setUsers(users.map((u) => (u.id === id ? updated : u)));
    } catch (err) {
      setError(err.message);
    }
  };

  const removeUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    setError("");
    try {
      await api(`/users/${id}`, { method: "DELETE" });
      setUsers(users.filter((u) => u.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const count = (role) => users.filter((u) => u.role === role).length;

  if (loading) return <div className="splash">Loading…</div>;

  return (
    <div className="page">
      <h1>Admin</h1>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="stats">
        <div className="card stat">
          <span>Results</span>
          <strong>{results.length}</strong>
        </div>
        <div className="card stat">
          <span>Students</span>
          <strong>{count("student")}</strong>
        </div>
        <div className="card stat">
          <span>Teachers</span>
          <strong>{count("teacher")}</strong>
        </div>
      </div>

      <div className="tabs tabs-inline" role="tablist">
        {["results", "users"].map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? "tab active" : "tab"}
            onClick={() => setTab(t)}
          >
            {t === "results" ? "Results" : "Users"}
          </button>
        ))}
      </div>

      {tab === "results" && (
        <div className="card table-wrap">
          {results.length === 0 ? (
            <p className="empty">No results yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll no</th>
                  <th>Institution</th>
                  <th>Subjects</th>
                  <th>Total</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id}>
                    <td>{r.name}</td>
                    <td>{r.rollno}</td>
                    <td>{r.institution}</td>
                    <td>{r.subjects.length}</td>
                    <td>{r.subjects.reduce((sum, s) => sum + s.marks, 0)}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => removeResult(r._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "users" && (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Roll no</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isMe = u.id === me.id;
                return (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        disabled={isMe}
                        aria-label={`Role for ${u.name}`}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                      >
                        <option value="student">student</option>
                        <option value="teacher">teacher</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>{u.rollno || "—"}</td>
                    <td className="actions">
                      <button
                        type="button"
                        className="btn btn-danger"
                        disabled={isMe}
                        onClick={() => removeUser(u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Admin;
