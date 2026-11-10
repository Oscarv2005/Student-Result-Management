import { NavLink } from "react-router-dom";
import { useAuth } from "./api";

const LINKS = [
  { to: "/result", label: "Results", roles: ["student", "teacher", "admin"] },
  { to: "/add", label: "Report", roles: ["teacher", "admin"] },
  { to: "/admin", label: "Admin", roles: ["admin"] },
];

function Nav() {
  const { user, signOut } = useAuth();

  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">R</span>
        Report<span>Manager</span>
      </div>
      <nav className="navlinks">
        {LINKS.filter((l) => l.roles.includes(user.role)).map((l) => (
          <NavLink key={l.to} to={l.to}>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="user-chip">
        <div>
          <strong>{user.name}</strong>
          <span className={`badge badge-${user.role}`}>{user.role}</span>
        </div>
        <button type="button" className="btn btn-ghost" onClick={signOut}>
          Log out
        </button>
      </div>
    </header>
  );
}

export default Nav;
