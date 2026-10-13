import { useEffect, useMemo, useRef, useState } from "react";
import adminUsers from "../../data/adminUsers";
import AdminSidebar from "./AdminSidebar";
import { useAdminTheme } from "./AdminThemeContext";
import "./dashboard.css";
import "./users.css";

const PAGE_SIZE = 6;

function AdminUsers() {
  const { theme } = useAdminTheme();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!selectedUser) return undefined;
    modalRef.current?.focus();
    const handleKeyDown = (event) => { if (event.key === "Escape") setSelectedUser(null); };
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("keydown", handleKeyDown); triggerRef.current?.focus(); };
  }, [selectedUser]);

  const summary = useMemo(() => ({
    total: adminUsers.length,
    candidates: adminUsers.filter((user) => user.role === "Candidate").length,
    recruiters: adminUsers.filter((user) => user.role === "Recruiter").length,
    active: adminUsers.filter((user) => user.status === "Active").length,
  }), []);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return adminUsers.filter((user) => (
      (!query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query))
      && (role === "All" || user.role === role)
      && (status === "All" || user.status === status)
    ));
  }, [search, role, status]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const visibleUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function updateFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  return (
    <div className="admin-dashboard" data-admin-theme={theme}>
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb"><span>Workspace</span><span className="admin-breadcrumb-separator">/</span><strong>User Management</strong></div>
          <div className="admin-topbar-right"><span className="admin-demo-badge"><span /> Demo data</span><div className="admin-avatar" aria-label="Admin profile">AD</div></div>
        </header>
        <div className="admin-content">
          <section className="admin-welcome">
            <div><p className="admin-eyebrow">ADMINISTRATION</p><h1>User Management</h1><p className="admin-welcome-copy">Review sample candidate and recruiter accounts on the platform.</p></div>
          </section>
          <div className="admin-sample-notice" role="note"><span className="admin-notice-icon" aria-hidden="true">i</span><span><strong>Sample data preview</strong> — these local illustrative records are not connected to live platform accounts.</span></div>

          <section className="admin-overview-grid admin-users-summary" aria-label="Sample user statistics">
            {[
              ["Total Users", summary.total, "blue"],
              ["Candidates", summary.candidates, "violet"],
              ["Recruiters", summary.recruiters, "teal"],
              ["Active Users", summary.active, "amber"],
            ].map(([label, value, tone]) => <article className="admin-stat-card" key={label}>
              <div className={`admin-stat-icon ${tone}`} aria-hidden="true">{label === "Candidates" ? "◉" : label === "Recruiters" ? "♧" : "♙"}</div>
              <div className="admin-stat-content"><span className="admin-stat-label">{label}</span><strong className="admin-stat-value">{value}</strong><span className="admin-users-caption">Sample records</span></div>
            </article>)}
          </section>

          <section className="admin-panel admin-users-panel" aria-labelledby="admin-users-list-title">
            <div className="admin-panel-heading admin-users-heading"><div><h2 id="admin-users-list-title">Platform users</h2><p>Search and filter the local sample dataset.</p></div></div>
            <div className="admin-users-filters">
              <label className="admin-users-search"><span className="admin-sr-only">Search by name or email</span><span aria-hidden="true">⌕</span><input type="search" placeholder="Search by name or email" value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} /></label>
              <label className="admin-users-select"><span>Role</span><select value={role} onChange={(event) => updateFilter(setRole, event.target.value)}><option>All</option><option>Candidate</option><option>Recruiter</option></select></label>
              <label className="admin-users-select"><span>Status</span><select value={status} onChange={(event) => updateFilter(setStatus, event.target.value)}><option>All</option><option>Active</option><option>Inactive</option></select></label>
            </div>
            {visibleUsers.length ? <>
              <div className="admin-users-table-wrap"><table className="admin-users-table"><thead><tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col">Status</th><th scope="col">Registration date</th><th scope="col"><span className="admin-sr-only">Actions</span></th></tr></thead>
                <tbody>{visibleUsers.map((user) => <tr key={user.id}>
                  <td><div className="admin-user-name"><span className="admin-user-avatar">{user.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><strong>{user.name}</strong></div></td>
                  <td className="admin-user-email">{user.email}</td><td><span className={`admin-role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                  <td><span className={`admin-status-badge ${user.status.toLowerCase()}`}><span />{user.status}</span></td>
                  <td><time dateTime={user.registered}>{new Date(`${user.registered}T00:00:00`).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })}</time></td>
                  <td><button className="admin-user-view" type="button" onClick={(event) => { triggerRef.current = event.currentTarget; setSelectedUser(user); }}>View details</button></td>
                </tr>)}</tbody>
              </table></div>
              <div className="admin-users-pagination"><span>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filteredUsers.length)} of {filteredUsers.length} sample users</span><div><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} aria-label="Previous page">Previous</button><span>Page {page} of {pageCount}</span><button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount} aria-label="Next page">Next</button></div></div>
            </> : <div className="admin-users-empty"><span aria-hidden="true">⌕</span><h3>No users found</h3><p>Try a different name, email, role, or status filter.</p></div>}
          </section>
          <footer className="admin-footer">© 2026 JobRecruit <span>•</span> Admin user management preview</footer>
        </div>
      </main>

      {selectedUser && <div className="admin-user-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedUser(null); }}>
        <section ref={modalRef} tabIndex={-1} className="admin-user-modal" role="dialog" aria-modal="true" aria-labelledby="admin-user-modal-title">
          <button className="admin-user-modal-close" type="button" onClick={() => setSelectedUser(null)} aria-label="Close details">×</button>
          <p className="admin-eyebrow">SAMPLE ACCOUNT</p><h2 id="admin-user-modal-title">{selectedUser.name}</h2><p className="admin-user-modal-email">{selectedUser.email}</p>
          <dl><div><dt>Role</dt><dd>{selectedUser.role}</dd></div><div><dt>Status</dt><dd>{selectedUser.status}</dd></div><div><dt>Registered</dt><dd>{new Date(`${selectedUser.registered}T00:00:00`).toLocaleDateString("en", { year: "numeric", month: "long", day: "numeric" })}</dd></div><div><dt>Record ID</dt><dd>USR-{String(selectedUser.id).padStart(4, "0")}</dd></div></dl>
          <button className="admin-user-modal-done" type="button" onClick={() => setSelectedUser(null)}>Close</button>
        </section>
      </div>}
    </div>
  );
}

export default AdminUsers;
