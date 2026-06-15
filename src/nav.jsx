function Navbar({ currentPage, onNavigate }) {
  // ✅ FIX: guard against undefined onNavigate prop
  const navigate = (id) => typeof onNavigate === "function" && onNavigate(id);
  const links = [
    { id: "home", label: "Dashboard" },
    { id: "results", label: "Enter Marks" },
    { id: "reports", label: "View Reports" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => navigate("home")}>
        StudRes<span>Grade</span>
      </div>
      <ul className="navbar-links">
        {links.map((link) => (
          <li key={link.id}>
            <button
              className={`nav-link ${currentPage === link.id ? "active" : ""}`}
              onClick={() => navigate(link.id)}
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
