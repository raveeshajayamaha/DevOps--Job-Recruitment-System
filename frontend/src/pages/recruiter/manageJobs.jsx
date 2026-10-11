import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { getJobs } from "../../services/jobService";
import "./dashboard.css";
import "./manageJobs.css";

const sidebarItems = [
  { label: "Dashboard", icon: "⌂", to: "/recruiter/dashboard", end: true },
  { label: "Post Job", icon: "+", to: "/recruiter/jobs/new", end: true },
  { label: "Manage Jobs", icon: "▣", to: "/recruiter/jobs", end: true },
  { label: "Applications", icon: "✓", to: "/recruiter/applications" },
  { label: "Interviews", icon: "◷", to: "/recruiter/interviews" },
  { label: "Profile", icon: "◎", to: "/recruiter/profile" },
  { label: "Settings", icon: "⚙", to: "/recruiter/settings" },
];

function ManageJobs() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const jobs = useMemo(() => getJobs(), []);

  const summary = useMemo(() => ({
    total: jobs.length,
    active: jobs.filter((job) => job.status === "active").length,
    closed: jobs.filter((job) => job.status === "closed").length,
    applicants: jobs.reduce((total, job) => total + job.applicantsCount, 0),
  }), [jobs]);

  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch = [job.title, job.company, job.location]
        .some((field) => field.toLowerCase().includes(normalizedSearch));
      const matchesStatus = statusFilter === "All" || job.status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchTerm, statusFilter]);

  return (
    <div className="recruiter-dashboard manage-jobs-page">
      <RecruiterSidebar />

      <main className="recruiter-main">
        <header className="recruiter-header">
          <div>
            <p className="recruiter-eyebrow">RECRUITER WORKSPACE</p>
            <h1>Manage Jobs</h1>
            <p className="recruiter-header-description">
              View, manage, and track your job postings.
            </p>
          </div>

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
        </header>

        <div className="recruiter-content">
          <div className="recruiter-content-toolbar manage-jobs-toolbar">
            <div>
              <h2>Your job postings</h2>
              <p>Keep track of your open and completed recruitment campaigns.</p>
            </div>
            <NavLink className="recruiter-primary-button" to="/recruiter/jobs/new">
              + Post New Job
            </NavLink>
          </div>

          <section className="recruiter-kpi-grid manage-jobs-summary" aria-label="Job posting summary">
            <SummaryCard label="Total Jobs" value={summary.total} icon="▣" tone="blue" />
            <SummaryCard label="Active Jobs" value={summary.active} icon="◉" tone="green" />
            <SummaryCard label="Closed Jobs" value={summary.closed} icon="✓" tone="orange" />
            <SummaryCard label="Total Applicants" value={summary.applicants} icon="♙" tone="purple" />
          </section>

          <section className="recruiter-card manage-jobs-list-card">
            <div className="manage-jobs-filters">
              <label className="manage-jobs-search">
                <span>Search jobs</span>
                <input
                  aria-label="Search jobs by title, company, or location"
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by title, company, or location"
                  type="search"
                  value={searchTerm}
                />
              </label>

              <div className="manage-jobs-status-filter" role="group" aria-label="Filter jobs by status">
                {["All", "Active", "Closed"].map((status) => (
                  <button
                    className={statusFilter === status ? "selected" : ""}
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    type="button"
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {filteredJobs.length > 0 ? (
              <div className="manage-jobs-list">
                {filteredJobs.map((job) => (
                  <article className="manage-job-row" key={job.id}>
                    <div className="manage-job-heading">
                      <div className="job-avatar">{job.title.charAt(0)}</div>
                      <div>
                        <h3>{job.title}</h3>
                        <p>{job.company}</p>
                      </div>
                    </div>
                    <div className="manage-job-facts">
                      <span><strong>Location</strong>{job.location}</span>
                      <span><strong>Job type</strong>{job.jobType}</span>
                      <span><strong>Salary</strong>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                      <span><strong>Posted</strong>{formatDate(job.postedDate)}</span>
                      <span><strong>Deadline</strong>{formatDate(job.deadline)}</span>
                    </div>
                    <div className="manage-job-meta">
                      <span className={`recruiter-status ${job.status}`}>{capitalize(job.status)}</span>
                      <strong>{job.applicantsCount} applicants</strong>
                      <NavLink className="recruiter-text-button" to={`/recruiter/jobs/${job.id}`}>
                        View
                      </NavLink>
                      <NavLink className="recruiter-text-button" to={`/recruiter/jobs/${job.id}/edit`}>
                        Edit
                      </NavLink>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="manage-jobs-empty" role="status">
                <strong>No jobs found</strong>
                <span>Try adjusting your search or status filter.</span>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatSalary(minimum, maximum) {
  return `Rs. ${minimum / 1000}K - ${maximum / 1000}K`;
}

function SummaryCard({ icon, label, tone, value }) {
  return (
    <article className="recruiter-kpi-card">
      <div className={`kpi-icon ${tone}`}>{icon}</div>
      <div>
        <span className="kpi-label">{label}</span>
        <strong className="kpi-value">{value}</strong>
      </div>
    </article>
  );
}

function RecruiterSidebar() {
  return (
    <aside className="recruiter-sidebar">
      <div className="recruiter-brand">
        <div className="recruiter-brand-logo">💼</div>
        <div>
          <strong>JobRecruit</strong>
          <span>Recruiter Portal</span>
        </div>
      </div>

      <nav className="recruiter-navigation" aria-label="Recruiter navigation">
        {sidebarItems.map((item) => (
          <NavLink
            className={({ isActive }) => `recruiter-nav-link${isActive ? " active" : ""}`}
            end={item.end}
            key={item.label}
            to={item.to}
          >
            <span className="recruiter-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="recruiter-sidebar-footer">
        <NavLink className="recruiter-nav-link" to="/">
          <span className="recruiter-nav-icon">↪</span>
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default ManageJobs;
