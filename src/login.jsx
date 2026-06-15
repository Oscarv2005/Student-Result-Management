import { useState } from "react";

const API_BASE = "https://stude-back-sigma.vercel.app";

function Login({ onAuthSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [alert, setAlert] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthAction = async (e, forceAction = null) => {
    if (e) e.preventDefault();
    
    if (!credentials.username || !credentials.password) {
      setAlert({ type: "error", message: "Please supply all credential tracks." });
      return;
    }

    const actionType = forceAction || (isRegistering ? "register" : "login");

    try {
      const response = await fetch(`${API_BASE}/api/auth/${actionType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      const result = await response.json();

      if (result.success) {
        if (actionType === "register") {
          setAlert({ type: "success", message: "Registration successful! Proceeding to log you in..." });
          try {
            const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(credentials),
            });
            const loginResult = await loginRes.json();
            if (loginResult.success) {
              setTimeout(() => onAuthSuccess(loginResult.token), 1000);
            }
          } catch (err) {
            setAlert({ type: "error", message: "Automatic login failed. Please use the Sign In action." });
          }
        } else {
          setAlert({ type: "success", message: "Authentication approved. Loading workspace..." });
          setTimeout(() => onAuthSuccess(result.token), 1000);
        }
      } else {
        setAlert({ type: "error", message: result.message });
      }
    } catch (err) {
      setAlert({ type: "error", message: "Network error. Core server line offline." });
    }
  };

  return (
    <div className="page-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
      <div className="glow-ambient"></div>
      <div className="form-container" style={{ width: "100%", maxWidth: "420px", margin: "0" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 className="page-title" style={{ fontSize: "1.5rem" }}>
            Stude <span>Res</span>Grade
          </h2>
          <p className="page-subtitle" style={{ marginBottom: "0", fontSize: "0.85rem" }}>
            {isRegistering ? "Create Administrative Profile" : "Administrative Identity Verification"}
          </p>
        </div>

        {alert && (
          <div className={`alert ${alert.type}`} style={{ margin: "0 0 1.5rem 0" }}>
            <span>{alert.message}</span>
          </div>
        )}

        <form onSubmit={(e) => handleAuthAction(e)}>
          <div className="form-section" style={{ marginBottom: "1.5rem" }}>
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label>Administrative Identifier (Username / Email)</label>
              <input type="text" name="username" placeholder="Enter identifier" value={credentials.username} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>System Access Key</label>
              <input type="password" name="password" placeholder="Enter password" value={credentials.password} onChange={handleInputChange} required />
            </div>
          </div>

          {!isRegistering ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button type="submit" className="btn-hero btn-primary" style={{ width: "100%", padding: "0.85rem" }}>
                Sign In
              </button>
              <button type="button" className="btn-hero btn-secondary" style={{ width: "100%", padding: "0.85rem" }} onClick={() => { setIsRegistering(true); setAlert(null); }}>
                New Registration
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button type="submit" className="btn-hero btn-primary" style={{ width: "100%", padding: "0.85rem" }}>
                Submit Register Request
              </button>
              <button type="button" className="btn-hero btn-secondary" style={{ width: "100%", padding: "0.85rem" }} onClick={() => { setIsRegistering(false); setAlert(null); }}>
                Back to Sign In
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
