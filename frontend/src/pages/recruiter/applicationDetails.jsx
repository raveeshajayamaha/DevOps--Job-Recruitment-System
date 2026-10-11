import { useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { getJobById } from "../../services/jobService";
import { getApplicationById, updateApplicationStatus } from "../../services/applicationService";
import { getInterviewsByApplicationId } from "../../services/interviewService";
import "./dashboard.css";
import "./applications.css";

const sidebarItems = [
  { label: "Dashboard", icon: "⌂", to: "/recruiter/dashboard", end: true },
  { label: "Post Job", icon: "+", to: "/recruiter/jobs/new", end: true },
  { label: "Manage Jobs", icon: "▣", to: "/recruiter/jobs", end: true },
  { label: "Applications", icon: "✓", to: "/recruiter/applications" },
  { label: "Interviews", icon: "◷", to: "/recruiter/interviews" },
  { label: "Profile", icon: "◎", to: "/recruiter/profile" },
  { label: "Settings", icon: "⚙", to: "/recruiter/settings" },
];

function RecruiterApplicationDetails() {
  const { applicationId } = useParams();
  const [application, setApplication] = useState(() => getApplicationById(applicationId));
  const [feedback, setFeedback] = useState("");
  const applicationInterviews = application ? getInterviewsByApplicationId(application.id) : [];
  const existingInterview = applicationInterviews[0];

  if (!application) {
    return (
      <ApplicationLayout>
        <section className="recruiter-card application-not-found" role="alert">
          <strong>Application not found</strong>
          <span>The requested application could not be found.</span>
          <NavLink className="recruiter-primary-button" to="/recruiter/applications">Back to Applications</NavLink>
        </section>
      </ApplicationLayout>
    );
  }

  const job = getJobById(application.jobId);

  const changeStatus = (status) => {
    const updatedApplication = updateApplicationStatus(application.id, status);
    if (updatedApplication) {
      setApplication(updatedApplication);
      setFeedback(`Application ${status === "shortlisted" ? "shortlisted" : "rejected"} successfully.`);
    }
  };

  return (
    <ApplicationLayout>
      <NavLink className="post-job-back-link" to="/recruiter/applications">← Back to Applications</NavLink>
      <div className="application-details-grid">
        <section className="recruiter-card application-detail-card">
          <div className="application-detail-heading">
            <div className="candidate-avatar">{getInitials(application.candidateName)}</div>
            <div>
              <h2>{application.candidateName}</h2>
              <p>{application.email}</p>
            </div>
            <span className={`recruiter-status ${application.status}`}>{formatStatus(application.status)}</span>
          </div>
          <DetailSection title="Candidate Information">
            <DetailFact label="Experience" value={application.experience} />
            <DetailFact label="Skills" value={application.skills.join(", ")} />
            <DetailFact label="Resume" value={application.resume} />
          </DetailSection>
          <DetailSection title="Applied Job">
            <DetailFact label="Job Title" value={application.jobTitle} />
            <DetailFact label="Company" value={application.company} />
            <DetailFact label="Location" value={job?.location || "—"} />
            <DetailFact label="Job Type" value={job?.jobType || "—"} />
            <DetailFact label="Application Date" value={formatDate(application.appliedDate)} />
          </DetailSection>
        </section>

        <section className="recruiter-card application-status-card">
          <h2>Application Status</h2>
          <p>Update this candidate&apos;s progress through your hiring process.</p>
          <div className="application-current-status">
            <span>Current status</span>
            <strong className={`recruiter-status ${application.status}`}>{formatStatus(application.status)}</strong>
          </div>
          <div className="application-actions">
            {application.status !== "shortlisted" && (
              <button className="application-shortlist-button" onClick={() => changeStatus("shortlisted")} type="button">Shortlist</button>
            )}
            {application.status !== "rejected" && (
              <button className="application-reject-button" onClick={() => changeStatus("rejected")} type="button">Reject</button>
            )}
          </div>
          {application.status === "shortlisted" && existingInterview && (
            <NavLink className="recruiter-primary-button application-interview-link" to={`/recruiter/interviews/${existingInterview.id}`}>
              View Interview Details
            </NavLink>
          )}
          {application.status === "shortlisted" && (
            <NavLink className="recruiter-primary-button application-interview-link" to={`/recruiter/interviews/schedule/${application.id}`}>
              {existingInterview ? "Schedule Another Interview" : "Schedule Interview"}
            </NavLink>
          )}
          {application.status !== "shortlisted" && application.status !== "rejected" && (
            <p className="application-schedule-note">Shortlist this candidate to schedule an interview.</p>
          )}
          {feedback && <div className="post-job-success" role="status"><strong>{feedback}</strong></div>}
        </section>
      </div>
    </ApplicationLayout>
  );
}

function ApplicationLayout({ children }) {
  return (
    <div className="recruiter-dashboard recruiter-applications-page">
      <RecruiterSidebar />
      <main className="recruiter-main">
        <header className="recruiter-header">
          <div>
            <p className="recruiter-eyebrow">RECRUITER WORKSPACE</p>
            <h1>Application Details</h1>
            <p className="recruiter-header-description">Review candidate information and application status.</p>
          </div>
          <div className="recruiter-header-actions">
            <button aria-label="Notifications" className="recruiter-icon-button" type="button">🔔<span className="recruiter-notification-dot">3</span></button>
            <div className="recruiter-avatar">AR</div>
            <div className="recruiter-profile-label"><strong>Alex R.</strong><span>Hiring Manager</span></div>
          </div>
        </header>
        <div className="recruiter-content">{children}</div>
      </main>
    </div>
  );
}

function RecruiterSidebar() {
  return (
    <aside className="recruiter-sidebar">
      <div className="recruiter-brand"><div className="recruiter-brand-logo">💼</div><div><strong>JobRecruit</strong><span>Recruiter Portal</span></div></div>
      <nav className="recruiter-navigation" aria-label="Recruiter navigation">
        {sidebarItems.map((item) => (
          <NavLink className={({ isActive }) => `recruiter-nav-link${isActive ? " active" : ""}`} end={item.end} key={item.label} to={item.to}>
            <span className="recruiter-nav-icon">{item.icon}</span><span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="recruiter-sidebar-footer"><NavLink className="recruiter-nav-link" to="/"><span className="recruiter-nav-icon">↪</span><span>Logout</span></NavLink></div>
    </aside>
  );
}

function DetailSection({ children, title }) {
  return <section className="application-detail-section"><h2>{title}</h2><div className="application-detail-facts">{children}</div></section>;
}

function DetailFact({ label, value }) {
  return <div className="application-detail-fact"><span>{label}</span><strong>{value}</strong></div>;
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

export default RecruiterApplicationDetails;
