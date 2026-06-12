function Navbar({ currentPage, onNavigate }) {
  const links = [
    { id: "home", label: "Dashboard" },
    { id: "results", label: "Enter Marks" },
    { id: "reports", label: "View Reports" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => onNavigate("home")}>
        StudRes<span>Grade</span>
      </div>
      <ul className="navbar-links">
        {links.map((link) => (
          <li key={link.id}>
            <button
              className={`nav-link ${currentPage === link.id ? "active" : ""}`}
              onClick={() => onNavigate(link.id)}
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
