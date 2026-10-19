import { logout } from "../../services/authService";
import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import sampleJobs from "../../data/recruiterJobs";
import { getApplications } from "../../services/applicationService";
import "./dashboard.css";
import "./applications.css";

const sidebarItems = [
  { label: "Dashboard", icon: "⌂", to: "/recruiter/dashboard", end: true },
  { label: "Post Job", icon: "+", to: "/recruiter/jobs/new", end: true },
  { label: "Manage Jobs", icon: "▣", to: "/recruiter/jobs", end: true },
  { label: "Applications", icon: "✓", to: "/recruiter/applications", end: true },
  { label: "Interviews", icon: "◷", to: "/recruiter/interviews" },
  { label: "Profile", icon: "◎", to: "/recruiter/profile" },
  { label: "Settings", icon: "⚙", to: "/recruiter/settings" },
];

function RecruiterApplications() {
  const applications = useMemo(() => getApplications(), []);
  const jobs = useMemo(() => sampleJobs, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredApplications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch = [
        application.candidateName,
        application.email,
        application.jobTitle,
        application.company,
      ].some((field) => field.toLowerCase().includes(normalizedSearch));
      const matchesJob = jobFilter === "all" || String(application.jobId) === jobFilter;
      const matchesStatus = statusFilter === "all" || application.status === statusFilter;

      return matchesSearch && matchesJob && matchesStatus;
    });
  }, [applications, jobFilter, searchTerm, statusFilter]);

  return (
    <div className="recruiter-dashboard recruiter-applications-page">
      <RecruiterSidebar />
      <main className="recruiter-main">
        <header className="recruiter-header">
          <div>
            <p className="recruiter-eyebrow">RECRUITER WORKSPACE</p>
            <h1>Applications</h1>
            <p className="recruiter-header-description">
              Manage candidates who applied to your jobs.
            </p>
          </div>
          <HeaderActions />
        </header>

        <div className="recruiter-content">
          <section className="recruiter-card recruiter-applications-card">
            <div className="applications-toolbar">
              <div>
                <h2>Candidate applications</h2>
                <p>Review candidates and track their application progress.</p>
              </div>
              <span className="applications-count">{filteredApplications.length} applications</span>
            </div>

            <div className="applications-filters">
              <label>
                <span>Search applications</span>
                <input
                  aria-label="Search candidates by name, email, or job"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search candidates by name, email, or job..."
                  type="search"
                  value={searchTerm}
                />
              </label>
              <label>
                <span>Job</span>
                <select aria-label="Filter applications by job" onChange={(event) => setJobFilter(event.target.value)} value={jobFilter}>
                  <option value="all">All Jobs</option>
                  {jobs.map((job) => <option key={job.id} value={job.id}>{job.title}</option>)}
                </select>
              </label>
              <label>
                <span>Status</span>
                <select aria-label="Filter applications by status" onChange={(event) => setStatusFilter(event.target.value)} value={statusFilter}>
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
            </div>

            {filteredApplications.length > 0 ? (
              <div className="applications-list">
                {filteredApplications.map((application) => (
                  <article className="application-row" key={application.id}>
                    <div className="candidate-avatar">{getInitials(application.candidateName)}</div>
                    <div className="application-candidate">
                      <strong>{application.candidateName}</strong>
                      <span>{application.email}</span>
                    </div>
                    <div className="application-job">
                      <strong>{application.jobTitle}</strong>
                      <span>{application.company}</span>
                    </div>
                    <div className="application-date">
                      <span>Applied</span>
                      <strong>{formatDate(application.appliedDate)}</strong>
                    </div>
                    <div className="application-row-action">
                      <span className={`recruiter-status ${application.status}`}>{formatStatus(application.status)}</span>
                      <NavLink className="recruiter-text-button" to={`/recruiter/applications/${application.id}`}>
                        View →
                      </NavLink>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="applications-empty" role="status">
                <strong>No applications found</strong>
                <span>Try adjusting your search or filters.</span>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function HeaderActions() {
  return (
    <div className="recruiter-header-actions">
      <button aria-label="Notifications" className="recruiter-icon-button" type="button">
        🔔<span className="recruiter-notification-dot">3</span>
      </button>
      <div className="recruiter-avatar">AR</div>
      <div className="recruiter-profile-label">
        <strong>Alex R.</strong>
        <span>Hiring Manager</span>
      </div>
    </div>
  );
}

function RecruiterSidebar() {
  return (
    <aside className="recruiter-sidebar">
      <div className="recruiter-brand">
        <div className="recruiter-brand-logo">💼</div>
        <div><strong>JobRecruit</strong><span>Recruiter Portal</span></div>
      </div>
      <nav className="recruiter-navigation" aria-label="Recruiter navigation">
        {sidebarItems.map((item) => (
          <NavLink className={({ isActive }) => `recruiter-nav-link${isActive ? " active" : ""}`} end={item.end} key={item.label} to={item.to}>
            <span className="recruiter-nav-icon">{item.icon}</span><span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="recruiter-sidebar-footer">
        <NavLink className="recruiter-nav-link" to="/" onClick={logout}><span className="recruiter-nav-icon">↪</span><span>Logout</span></NavLink>
      </div>
    </aside>
  );
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function formatStatus(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getInitials(name) {
  return name.split(" ").map((part) => part.charAt(0)).join("").slice(0, 2);
}

export default RecruiterApplications;
