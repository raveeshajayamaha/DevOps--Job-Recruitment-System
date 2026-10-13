import { NavLink } from "react-router-dom";
import {
  applicationPipeline,
  recentApplications,
  recruiterKpis,
  recruitmentActivity,
  upcomingInterviews,
} from "../../data/recruiterDashboard";
import { getJobs } from "../../services/jobService";
import "./dashboard.css";

const sidebarItems = [
  { label: "Dashboard", icon: "⌂", to: "/recruiter/dashboard", end: true },
  { label: "Post Job", icon: "+", to: "/recruiter/jobs/new", end: true },
  { label: "Manage Jobs", icon: "▣", to: "/recruiter/jobs", end: true },
  { label: "Applications", icon: "✓", to: "/recruiter/applications" },
  { label: "Interviews", icon: "◷", to: "/recruiter/interviews" },
  { label: "Profile", icon: "◎", to: "/recruiter/profile" },
  { label: "Settings", icon: "⚙", to: "/recruiter/settings" },
];

function RecruiterDashboard() {
  const activeJobs = getJobs()
    .filter((job) => job.status === "active")
    .map((job) => ({
      ...job,
      applications: job.applicantsCount,
      posted: formatDate(job.postedDate),
      type: job.jobType,
    }));

  return (
    <div className="recruiter-dashboard">
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
              className={({ isActive }) =>
                `recruiter-nav-link${isActive ? " active" : ""}`
              }
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

      <main className="recruiter-main">
        <header className="recruiter-header">
          <div>
            <p className="recruiter-eyebrow">Recruitment overview</p>
            <h1>Welcome back, Alex 👋</h1>
            <p className="recruiter-header-description">
              Here&apos;s what&apos;s happening with your recruitment activity today.
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
          <div className="recruiter-content-toolbar">
            <div>
              <h2>Recruitment at a glance</h2>
              <p>Track your hiring activity and keep your team moving.</p>
            </div>
            <NavLink className="recruiter-primary-button" to="/recruiter/jobs/new">
              + Post a Job
            </NavLink>
          </div>

          <section className="recruiter-kpi-grid" aria-label="Recruitment key performance indicators">
            {recruiterKpis.map((kpi) => (
              <KpiCard key={kpi.label} kpi={kpi} />
            ))}
          </section>

          <section className="recruiter-card recruiter-pipeline-card">
            <SectionHeader
              title="Application Pipeline"
              description="Candidates currently moving through your hiring process."
              linkLabel="View Applications"
              linkTo="/recruiter/applications"
            />
            <div className="pipeline-grid">
              {applicationPipeline.map((stage) => (
                <div className="pipeline-stage" key={stage.label}>
                  <div className="pipeline-stage-header">
                    <span className="pipeline-stage-dot" style={{ background: stage.color }} />
                    <span>{stage.label}</span>
                    <strong>{stage.count}</strong>
                  </div>
                  <div className="pipeline-bar">
                    <span style={{ background: stage.color, width: `${Math.max(stage.count, 8)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="recruiter-dashboard-grid">
            <section className="recruiter-card">
              <SectionHeader
                title="Recent Applications"
                description="The latest candidates to join your pipeline."
                linkLabel="View All"
                linkTo="/recruiter/applications"
              />
              <div className="application-list">
                {recentApplications.map((application) => (
                  <article className="recruiter-application-row" key={application.id}>
                    <div className="candidate-avatar">{application.initials}</div>
                    <div className="application-candidate">
                      <strong>{application.candidate}</strong>
                      <span>{application.job}</span>
                      <small>{application.summary}</small>
                    </div>
                    <div className="application-row-meta">
                      <span className={`recruiter-status ${application.statusClass}`}>
                        {application.status}
                      </span>
                      <small>Applied {application.date}</small>
                    </div>
                    <NavLink className="recruiter-text-button" to="/recruiter/applications">
                      View
                    </NavLink>
                  </article>
                ))}
              </div>
            </section>

            <section className="recruiter-card">
              <SectionHeader
                title="Upcoming Interviews"
                description="Your next conversations with candidates."
                linkLabel="View Calendar"
                linkTo="/recruiter/interviews"
              />
              <div className="interview-list">
                {upcomingInterviews.map((interview) => (
                  <article className="recruiter-interview-row" key={interview.id}>
                    <div className="interview-date">
                      <strong>{interview.date.split(" ")[0]}</strong>
                      <span>{interview.date.split(" ")[1].slice(0, 3)}</span>
                    </div>
                    <div className="interview-details">
                      <strong>{interview.candidate}</strong>
                      <span>{interview.job}</span>
                      <small>{interview.time} · {interview.type}</small>
                    </div>
                    <span className={`recruiter-status ${interview.status === "Pending" ? "pending" : "confirmed"}`}>
                      {interview.status}
                    </span>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <div className="recruiter-dashboard-grid lower-grid">
            <section className="recruiter-card">
              <SectionHeader
                title="Active Jobs"
                description="Open roles currently accepting applications."
                linkLabel="View All"
                linkTo="/recruiter/jobs"
              />
              <div className="active-jobs-list">
                {activeJobs.map((job) => (
                  <article className="active-job-row" key={job.id}>
                    <div className="job-avatar">{job.title.charAt(0)}</div>
                    <div className="active-job-details">
                      <strong>{job.title}</strong>
                      <span>{job.location} · {job.type}</span>
                    </div>
                    <div className="active-job-meta">
                      <strong>{job.applications}</strong>
                      <span>applications</span>
                    </div>
                    <div className="active-job-posted">
                      <span>Posted</span>
                      <small>{job.posted}</small>
                    </div>
                    <span className="recruiter-status active">Active</span>
                  </article>
                ))}
              </div>
            </section>

            <section className="recruiter-card activity-card">
              <SectionHeader
                title="Recent Activity"
                description="A quick view of the latest team updates."
              />
              <div className="activity-list">
                {recruitmentActivity.map((activity) => (
                  <div className="activity-row" key={activity}>
                    <span className="activity-icon">✓</span>
                    <span>{activity}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function KpiCard({ kpi }) {
  return (
    <article className="recruiter-kpi-card">
      <div className={`kpi-icon ${kpi.tone}`}>{kpi.icon}</div>
      <div>
        <span className="kpi-label">{kpi.label}</span>
        <strong className="kpi-value">{kpi.value}</strong>
        <small>{kpi.detail}</small>
      </div>
      <span className="kpi-trend">↗</span>
    </article>
  );
}

function SectionHeader({ title, description, linkLabel, linkTo }) {
  return (
    <div className="recruiter-section-header">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {linkLabel && linkTo && (
        <NavLink className="recruiter-section-link" to={linkTo}>
          {linkLabel} →
        </NavLink>
      )}
    </div>
  );
}

export default RecruiterDashboard;

function formatDate(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
