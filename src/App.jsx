import { useState, useEffect } from "react";
import "./index.css";
import Navbar from "./nav";
import Home from "./hero";
import Result from "./Result";
import Report from "./Report";
import Login from "./login";

// ✅ FIX: Use environment variable for API base URL.
// In local dev:  set VITE_API_URL=http://localhost:5000 in your .env file
// On Vercel:     set VITE_API_URL=https://your-backend.onrender.com in project settings
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [studentsData, setStudentsData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("rms_session_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // ✅ FIX: was "http://localhost:5000/api/students" — broken on Vercel
    fetch(`${API_BASE}/api/students`)
      .then((res) => res.json())
      .then((data) => setStudentsData(data))
      .catch((err) => console.error("Database connection fault:", err));
  }, [isAuthenticated]);

  const handleAuthSuccess = (token) => {
    localStorage.setItem("rms_session_token", token);
    setIsAuthenticated(true);
    setCurrentPage("home");
  };

  const handleLogout = () => {
    localStorage.removeItem("rms_session_token");
    setIsAuthenticated(false);
  };

  const handleAddStudent = async (studentData) => {
    try {
      // ✅ FIX: was "http://localhost:5000/api/students" — broken on Vercel
      const response = await fetch(`${API_BASE}/api/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });
      const result = await response.json();
      if (result.success) {
        setStudentsData((prev) => [...prev, result.data]);
      }
    } catch (err) {
      console.error("Transmission breakdown:", err);
    }
  };

  const renderPage = () => {
    if (!isAuthenticated) {
      return <Login onAuthSuccess={handleAuthSuccess} />;
    }

    switch (currentPage) {
      case "home":
        return <Home onNavigate={setCurrentPage} studentsData={studentsData} />;
      case "results":
        return <Result onAddStudent={handleAddStudent} />;
      case "reports":
        return <Report studentsData={studentsData} />;
      default:
        return <Home onNavigate={setCurrentPage} studentsData={studentsData} />;
    }
  };

  return (
    <div className="app-container">
      <div className="glow-ambient"></div>

      {isAuthenticated && (
        <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      )}

      {isAuthenticated && (
        <div
          className="page-container"
          style={{
            paddingBottom: "0",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button className="clear-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      )}

      {renderPage()}

      <footer className="footer">
        <p>© 2026 StudentGrade Portal. Architectural Matrix Interface.</p>
      </footer>
    </div>
  );
}

export default App;
