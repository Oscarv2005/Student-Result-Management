import { useMemo } from "react";

function Home({ onNavigate, studentsData = [] }) {
  const stats = useMemo(() => {
    const total = studentsData.length;
    if (total === 0) return { total: 0, average: "0.00", passRate: "0%" };

    const sum = studentsData.reduce(
      (acc, curr) => acc + parseFloat(curr.averageMarks || 0),
      0,
    );
    const globalAvg = (sum / total).toFixed(2);

    const passingCount = studentsData.filter(
      (s) => s.overallGrade !== "F",
    ).length;
    const passRate = ((passingCount / total) * 100).toFixed(0) + "%";

    return { total, average: globalAvg, passRate };
  }, [studentsData]);

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="hero-badge">OFFICIAL ADMINISTRATIVE CONSOLE</span>
          <h1>Result Management System</h1>
          <p>
            An integrated database interface designed for academic
            administrators to manage student records, log subject evaluations,
            and track dynamic performance metrics.
          </p>
          <div className="hero-buttons">
            <button
              className="btn-hero btn-primary"
              onClick={() => onNavigate("results")}
            >
              Add Student Record
            </button>
            <button
              className="btn-hero btn-secondary"
              onClick={() => onNavigate("reports")}
            >
              View Report Ledger
            </button>
          </div>
        </div>
      </section>

      <section className="page-container">
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 className="page-title">Institutional Overview</h2>
          <p className="page-subtitle">
            Live aggregate statistics compiled from active system configurations
          </p>
        </div>

        <div className="cards-grid">
          <div className="card text-center">
            <div className="card-icon">👥</div>
            <div className="card-value">{stats.total}</div>
            <h3>Total Students</h3>
            <p style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>
              Registered students in active records.
            </p>
          </div>
          <div className="card text-center">
            <div className="card-icon">🎯</div>
            <div className="card-value">{stats.average}</div>
            <h3>Institutional Average</h3>
            <p style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>
              Mean grade score computed across all courses.
            </p>
          </div>
          <div className="card text-center">
            <div className="card-icon">CN</div>
            <div className="card-value">{stats.passRate}</div>
            <h3>Passing Percentage</h3>
            <p style={{ color: "var(--text-light)", fontSize: "0.85rem" }}>
              Students clearing the minimum pass threshold.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
