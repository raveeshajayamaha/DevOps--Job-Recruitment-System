import { useMemo, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import { useAdminTheme } from "./AdminThemeContext";
import "./dashboard.css";
import "./activityLogs.css";

const PAGE_SIZE = 6;

// Illustrative records for layout preview only; these are not system audit events.
const sampleActivities = [
  { id: "sample-01", category: "User", actor: "Admin preview", action: "Reviewed a sample candidate account", target: "Candidate account", date: "2026-10-11", time: "09:12" },
  { id: "sample-02", category: "Job", actor: "Admin preview", action: "Viewed a sample job posting", target: "Frontend Developer", date: "2026-10-11", time: "09:05" },
  { id: "sample-03", category: "Application", actor: "Admin preview", action: "Reviewed a sample application", target: "Software Engineer application", date: "2026-10-10", time: "16:42" },
  { id: "sample-04", category: "System", actor: "System preview", action: "Sample dashboard data refreshed", target: "Admin preview workspace", date: "2026-10-10", time: "14:20" },
  { id: "sample-05", category: "User", actor: "Admin preview", action: "Viewed a sample recruiter account", target: "Recruiter account", date: "2026-10-09", time: "11:18" },
  { id: "sample-06", category: "Job", actor: "Admin preview", action: "Reviewed a sample job status", target: "Product Designer", date: "2026-10-08", time: "15:36" },
  { id: "sample-07", category: "Application", actor: "Admin preview", action: "Viewed sample application details", target: "Marketing Associate application", date: "2026-10-08", time: "10:04" },
  { id: "sample-08", category: "System", actor: "System preview", action: "Illustrative preview notice displayed", target: "Activity Logs page", date: "2026-10-07", time: "08:30" },
  { id: "sample-09", category: "User", actor: "Admin preview", action: "Viewed sample user records", target: "User Management preview", date: "2026-10-06", time: "13:15" },
];

const categoryTones = {
  User: "violet",
  Job: "blue",
  Application: "teal",
  System: "amber",
};

function ActivityLogs() {
  const { theme } = useAdminTheme();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);

  const summary = useMemo(() => ({
    total: sampleActivities.length,
    users: sampleActivities.filter((activity) => activity.category === "User").length,
    jobs: sampleActivities.filter((activity) => activity.category === "Job").length,
    applications: sampleActivities.filter((activity) => activity.category === "Application").length,
  }), []);

  const filteredActivities = useMemo(() => {
    const query = search.trim().toLowerCase();
    const today = new Date();
    const cutoff = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (dateFilter === "7") cutoff.setDate(cutoff.getDate() - 6);
    if (dateFilter === "30") cutoff.setDate(cutoff.getDate() - 29);

    return sampleActivities.filter((activity) => {
      const matchesSearch = !query || [activity.category, activity.actor, activity.action, activity.target]
        .some((value) => value.toLowerCase().includes(query));
      const matchesCategory = category === "All categories" || activity.category === category;
      const activityDate = new Date(`${activity.date}T00:00:00`);
      const matchesDate = dateFilter === "all" || activityDate >= cutoff;
      return matchesSearch && matchesCategory && matchesDate;
    });
  }, [search, category, dateFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredActivities.length / PAGE_SIZE));
  const visibleActivities = filteredActivities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const updateFilter = (setter, value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div className="admin-dashboard" data-admin-theme={theme}>
      <AdminSidebar />
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb"><span>Workspace</span><span className="admin-breadcrumb-separator">/</span><strong>Activity Logs</strong></div>
          <div className="admin-topbar-right"><span className="admin-demo-badge"><span /> Demo data</span><div className="admin-avatar" aria-label="Admin profile">AD</div></div>
        </header>
        <div className="admin-content">
          <section className="admin-welcome">
            <div><p className="admin-eyebrow">ADMINISTRATION</p><h1>Activity Logs</h1><p className="admin-welcome-copy">Browse illustrative activity records across the preview workspace.</p></div>
          </section>

          <div className="admin-sample-notice" role="note">
            <span className="admin-notice-icon" aria-hidden="true">i</span>
            <span><strong>Illustrative sample data</strong> — these records are for interface preview only and are not actual system events or audit logs.</span>
          </div>

          <section className="admin-overview-grid admin-activity-logs-summary" aria-label="Illustrative activity totals">
            {[
              ["Total Activities", summary.total, "blue"],
              ["User Activities", summary.users, "violet"],
              ["Job Activities", summary.jobs, "teal"],
              ["Application Activities", summary.applications, "amber"],
            ].map(([label, value, tone]) => (
              <article className="admin-stat-card" key={label}>
                <div className={`admin-stat-icon ${tone}`} aria-hidden="true">{label === "Total Activities" ? "T" : label.charAt(0)}</div>
                <div className="admin-stat-content"><span className="admin-stat-label">{label}</span><strong className="admin-stat-value">{value}</strong><span className="admin-activity-logs-caption">Sample records</span></div>
              </article>
            ))}
          </section>

          <section className="admin-panel admin-activity-logs-panel" aria-labelledby="admin-activity-logs-title">
            <div className="admin-panel-heading"><div><h2 id="admin-activity-logs-title">Activity records</h2><p>Search and filter the local illustrative dataset.</p></div></div>
            <div className="admin-activity-logs-filters">
              <label className="admin-activity-logs-search">
                <span className="admin-sr-only">Search activities</span><span aria-hidden="true">⌕</span>
                <input type="search" placeholder="Search activity, actor, or target" value={search} onChange={(event) => updateFilter(setSearch, event.target.value)} />
              </label>
              <label className="admin-activity-logs-select"><span>Category</span><select value={category} onChange={(event) => updateFilter(setCategory, event.target.value)}><option>All categories</option><option>User</option><option>Job</option><option>Application</option><option>System</option></select></label>
              <label className="admin-activity-logs-select"><span>Date range</span><select value={dateFilter} onChange={(event) => updateFilter(setDateFilter, event.target.value)}><option value="all">All dates</option><option value="7">Last 7 days</option><option value="30">Last 30 days</option></select></label>
            </div>

            {visibleActivities.length ? <>
              <div className="admin-activity-logs-table-wrap">
                <table className="admin-activity-logs-table">
                  <thead><tr><th scope="col">Category</th><th scope="col">Activity</th><th scope="col">Actor</th><th scope="col">Target</th><th scope="col">Date and time</th></tr></thead>
                  <tbody>{visibleActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td><span className={`admin-activity-category ${categoryTones[activity.category]}`}>{activity.category}</span></td>
                      <td className="admin-activity-action">{activity.action}</td>
                      <td>{activity.actor}</td><td>{activity.target}</td>
                      <td><time dateTime={`${activity.date}T${activity.time}`}>{new Date(`${activity.date}T${activity.time}:00`).toLocaleString("en", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              {filteredActivities.length > PAGE_SIZE && <div className="admin-activity-logs-pagination"><span>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filteredActivities.length)} of {filteredActivities.length} sample activities</span><div><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} aria-label="Previous page">Previous</button><span>Page {page} of {pageCount}</span><button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount} aria-label="Next page">Next</button></div></div>}
            </> : <div className="admin-activity-logs-empty"><span aria-hidden="true">⌕</span><h3>No activity records found</h3><p>Try a different search term, category, or date range.</p></div>}
          </section>
          <footer className="admin-footer">© 2026 JobRecruit <span>•</span> Admin activity preview</footer>
        </div>
      </main>
    </div>
  );
}

export default ActivityLogs;
