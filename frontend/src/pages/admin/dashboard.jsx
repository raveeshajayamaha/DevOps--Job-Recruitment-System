import AdminSidebar from "./AdminSidebar";
import { useAdminTheme } from "./AdminThemeContext";
import "./dashboard.css";

const overviewCards = [
  { label: "Total Users", value: "2,486", change: "+12.8%", icon: "♙", tone: "blue" },
  { label: "Total Candidates", value: "1,842", change: "+9.4%", icon: "◎", tone: "violet" },
  { label: "Total Recruiters", value: "644", change: "+6.2%", icon: "♧", tone: "teal" },
  { label: "Total Jobs", value: "328", change: "+18.6%", icon: "▤", tone: "amber" },
  { label: "Total Applications", value: "5,672", change: "+14.3%", icon: "✓", tone: "rose" },
];

const recentActivity = [
  { initials: "AM", title: "A new candidate account was created", detail: "Alex Morgan · Candidate", time: "8 minutes ago", tone: "blue" },
  { initials: "TC", title: "A recruiter account was updated", detail: "TechCore Solutions · Recruiter", time: "32 minutes ago", tone: "violet" },
  { initials: "JD", title: "A job posting was submitted for review", detail: "Product Designer · Northstar Labs", time: "1 hour ago", tone: "amber" },
  { initials: "SK", title: "A candidate application was received", detail: "Senior Engineer · Sarah Kim", time: "2 hours ago", tone: "teal" },
  { initials: "RW", title: "A job posting was published", detail: "Marketing Associate · Redwood Group", time: "3 hours ago", tone: "rose" },
];

function AdminDashboard() {
  const { theme } = useAdminTheme();
  return (
    <div className="admin-dashboard" data-admin-theme={theme}>
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-breadcrumb"><span>Workspace</span><span className="admin-breadcrumb-separator">/</span><strong>Overview</strong></div>
          <div className="admin-topbar-right">
            <span className="admin-demo-badge"><span /> Demo data</span>
            <div className="admin-avatar" aria-label="Admin profile">AD</div>
          </div>
        </header>

        <div className="admin-content">
          <section className="admin-welcome">
            <div>
              <p className="admin-eyebrow">SUNDAY, OCTOBER 11, 2026</p>
              <h1>Good morning, Admin</h1>
              <p className="admin-welcome-copy">Here&apos;s an overview of what&apos;s happening across your recruitment platform.</p>
            </div>
            <button className="admin-period-button" type="button" disabled>
              <span aria-hidden="true">◷</span> Last 30 days <span aria-hidden="true">⌄</span>
            </button>
          </section>

          <div className="admin-sample-notice" role="note">
            <span className="admin-notice-icon" aria-hidden="true">i</span>
            <span><strong>Sample data preview</strong> — all figures and activity below are illustrative and are not connected to live platform data.</span>
          </div>

          <section className="admin-overview-grid" aria-label="Platform overview sample statistics">
            {overviewCards.map((card) => (
              <article className="admin-stat-card" key={card.label}>
                <div className={`admin-stat-icon ${card.tone}`} aria-hidden="true">{card.icon}</div>
                <div className="admin-stat-content">
                  <span className="admin-stat-label">{card.label}</span>
                  <strong className="admin-stat-value">{card.value}</strong>
                  <span className="admin-stat-change"><span aria-hidden="true">↗</span> {card.change} <span className="admin-change-caption">vs last month</span></span>
                </div>
                <span className="admin-stat-menu" aria-hidden="true">···</span>
              </article>
            ))}
          </section>

          <section className="admin-panel admin-activity-panel">
            <div className="admin-panel-heading">
              <div>
                <h2>Recent activity</h2>
                <p>A sample of the latest events across the platform.</p>
              </div>
              <button className="admin-view-button" type="button" disabled>View activity <span aria-hidden="true">→</span></button>
            </div>
            <div className="admin-activity-list">
              {recentActivity.map((activity) => (
                <article className="admin-activity-row" key={`${activity.initials}-${activity.time}`}>
                  <div className={`admin-activity-avatar ${activity.tone}`}>{activity.initials}</div>
                  <div className="admin-activity-copy">
                    <strong>{activity.title}</strong>
                    <span>{activity.detail}</span>
                  </div>
                  <time>{activity.time}</time>
                  <span className="admin-activity-chevron" aria-hidden="true">›</span>
                </article>
              ))}
            </div>
            <div className="admin-activity-footer">Showing 5 sample events <span>•</span> Updated just now</div>
          </section>

          <footer className="admin-footer">© 2026 JobRecruit <span>•</span> Admin dashboard preview</footer>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
