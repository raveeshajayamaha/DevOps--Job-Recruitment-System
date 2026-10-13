import { NavLink } from "react-router-dom";

const adminNavigation = [
  { label: "Overview", to: "/admin/dashboard", end: true },
  { label: "User Management", to: "/admin/users" },
  { label: "Job Management", to: "/admin/jobs" },
  { label: "Application Management", to: "/admin/applications" },
  { label: "Activity Logs", to: "/admin/activity-logs", end: true },
  { label: "Settings", to: "/admin/settings", end: true },
];

function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-mark">J</div>
        <div className="admin-brand-copy">
          <strong>JobRecruit</strong>
          <span>Administration</span>
        </div>
      </div>

      <div className="admin-nav-heading">WORKSPACE</div>
      <nav className="admin-navigation" aria-label="Admin navigation">
        {adminNavigation.map((item) => item.to ? (
          <NavLink
            className={({ isActive }) => `admin-nav-link${isActive ? " active" : ""}`}
            end={item.end}
            key={item.label}
            to={item.to}
          >
            <span>{item.label}</span>
          </NavLink>
        ) : (
          <div className="admin-nav-link admin-nav-link-static" key={item.label}>
            <span>{item.label}</span>
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-bottom">
        <div className="admin-sidebar-note">
          <span className="admin-note-dot" />
          <div><strong>Sample dashboard</strong><span>Preview data only</span></div>
        </div>
        <NavLink className="admin-nav-link admin-home-link" to="/">
          <span>Back to website</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default AdminSidebar;
