import { useEffect, useState } from "react";
import { logout } from "../../services/authService";
import { NavLink, useParams } from "react-router-dom";
import { getJobById } from "../../services/jobService";
import "./dashboard.css";
import "./jobDetails.css";

const sidebarItems = [
  { label: "Dashboard", icon: "⌂", to: "/recruiter/dashboard", end: true },
  { label: "Post Job", icon: "+", to: "/recruiter/jobs/new", end: true },
  { label: "Manage Jobs", icon: "▣", to: "/recruiter/jobs" },
  { label: "Applications", icon: "✓", to: "/recruiter/applications" },
  { label: "Interviews", icon: "◷", to: "/recruiter/interviews" },
  { label: "Profile", icon: "◎", to: "/recruiter/profile" },
  { label: "Settings", icon: "⚙", to: "/recruiter/settings" },
];

function RecruiterJobDetails() {
  const { jobId } = useParams();
  const [result, setResult] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    getJobById(jobId, controller.signal)
      .then(job => setResult({ jobId, job }))
      .catch(error => { if (!controller.signal.aborted) setResult({ jobId, error }); });
    return () => controller.abort();
  }, [jobId]);
  const loading = !result || result.jobId !== jobId;
  const job = loading ? null : result.job;

  return (
    <div className="recruiter-dashboard recruiter-job-details-page">
      <RecruiterSidebar />

      <main className="recruiter-main">
        <header className="recruiter-header">
          <div>
            <p className="recruiter-eyebrow">RECRUITER WORKSPACE</p>
            <h1>Job Details</h1>
            <p className="recruiter-header-description">
              Review the details and performance of this job posting.
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
          {loading ? <p role="status">Loading job...</p> : result.error && result.error.status !== 404 ? <p role="alert">{result.error.message}</p> : job ? <JobContent job={job} /> : <JobNotFound />}
        </div>
      </main>
    </div>
  );
}

function JobContent({ job }) {
  return (
    <>
      <section className="recruiter-card recruiter-job-summary-card">
        <div className="recruiter-job-title-block">
          <div className="job-avatar">{job.title.charAt(0)}</div>
          <div>
            <h2>{job.title}</h2>
            <p>{job.company}</p>
          </div>
        </div>
        <div className="recruiter-job-summary-grid">
          <JobFact label="Location" value={job.location} />
          <JobFact label="Job Type" value={job.jobType} />
          <JobFact label="Salary Range" value={formatSalary(job.salaryMin, job.salaryMax)} />
          <JobFact label="Status" value={<span className={`recruiter-status ${job.status}`}>{capitalize(job.status)}</span>} />
          <JobFact label="Applicants" value={job.applicantsCount} />
          <JobFact label="Posted Date" value={formatDate(job.postedDate)} />
          <JobFact label="Application Deadline" value={formatDate(job.deadline)} />
        </div>
      </section>

      <div className="recruiter-job-details-grid">
        <section className="recruiter-card recruiter-job-content-card">
          <JobSection title="Job Description">
            <p className="recruiter-job-description">{job.description}</p>
          </JobSection>
          <JobSection title="Requirements">
            <ul className="recruiter-job-requirements">
              {job.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
            </ul>
          </JobSection>
        </section>

        <section className="recruiter-card recruiter-job-side-card">
          <JobSection title="Required Skills">
            <div className="recruiter-skill-list">
              {job.skills.map((skill) => <span className="recruiter-skill-tag" key={skill}>{skill}</span>)}
            </div>
          </JobSection>
          <JobSection title="Application Information">
            <div className="recruiter-application-summary">
              <JobFact label="Total Applicants" value={job.applicantsCount} />
              <JobFact label="Application Deadline" value={formatDate(job.deadline)} />
              <JobFact label="Job Status" value={<span className={`recruiter-status ${job.status}`}>{capitalize(job.status)}</span>} />
            </div>
          </JobSection>
        </section>
      </div>

      <div className="recruiter-job-actions">
        <NavLink className="recruiter-secondary-button" to="/recruiter/jobs">
          Back to Manage Jobs
        </NavLink>
        <button className="recruiter-disabled-button" disabled type="button">
          Edit Job
        </button>
      </div>
    </>
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

function JobNotFound() {
  return (
    <section className="recruiter-card recruiter-job-not-found" role="alert">
      <strong>Job not found</strong>
      <span>The requested job posting could not be found.</span>
      <NavLink className="recruiter-primary-button" to="/recruiter/jobs">
        Back to Manage Jobs
      </NavLink>
    </section>
  );
}

function JobSection({ children, title }) {
  return (
    <section className="recruiter-job-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function JobFact({ label, value }) {
  return (
    <div className="recruiter-job-fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
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
        <NavLink className="recruiter-nav-link" to="/" onClick={logout}>
          <span className="recruiter-nav-icon">↪</span>
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default RecruiterJobDetails;
