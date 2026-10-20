import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CandidateLayout from "./candidateLayout";
import { getMyApplications } from "../../services/applicationService";
import "./applications.css";

const statusOptions = ["All", "Pending", "Shortlisted", "Interview", "Rejected"];

const statusClassNames = {
  Pending: "pending",
  Shortlisted: "shortlisted",
  Interview: "interview",
  Rejected: "rejected",
};

function Applications() {
  const [result, setResult] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    getMyApplications(controller.signal)
      .then(applications => setResult({ applications: applications.map(application => ({ ...application, status: application.status.charAt(0).toUpperCase() + application.status.slice(1) })) }))
      .catch(error => { if (!controller.signal.aborted) setResult({ error }); });
    return () => controller.abort();
  }, []);
  const applications = useMemo(() => result?.applications || [], [result]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredApplications = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesStatus =
        statusFilter === "All" || application.status === statusFilter;
      const matchesSearch =
        !normalizedSearch ||
        application.jobTitle.toLowerCase().includes(normalizedSearch) ||
        application.company.toLowerCase().includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [applications, searchTerm, statusFilter]);

  const getStatusCount = (status) =>
    applications.filter((application) => application.status === status).length;

  return (
    <CandidateLayout
      title="Applications"
      eyebrow="Candidate applications"
    >
      <div className="applications-page-content">
        <p className="applications-subtitle">
          Track the status of jobs you have applied for.
        </p>

        <section className="application-summary-grid" aria-label="Application summary">
          <SummaryCard label="Total Applications" value={applications.length} />
          <SummaryCard label="Pending" value={getStatusCount("Pending")} />
          <SummaryCard label="Shortlisted" value={getStatusCount("Shortlisted")} />
          <SummaryCard label="Interview" value={getStatusCount("Interview")} />
          <SummaryCard label="Rejected" value={getStatusCount("Rejected")} />
        </section>

        <section className="candidate-card application-list-card">
          <div className="applications-toolbar">
            <div>
              <h2>Application history</h2>
              <p>{filteredApplications.length} application{filteredApplications.length === 1 ? "" : "s"} shown</p>
            </div>

            <div className="application-filters">
              <label>
                Search applications
                <input
                  type="search"
                  placeholder="Job title or company"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </label>
              <label>
                Status
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {!result ? <p role="status">Loading applications...</p> : result.error ? <p role="alert">{result.error.message}</p> : filteredApplications.length === 0 ? (
            <div className="applications-empty-state">
              <div className="empty-state-icon">📄</div>
              <h3>No applications found.</h3>
              <p>Try selecting a different status or search term.</p>
            </div>
          ) : (
            <div className="application-list">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  application={application}
                  key={application.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </CandidateLayout>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="application-summary-card">
      <span className="application-summary-value">{value}</span>
      <span className="application-summary-label">{label}</span>
    </div>
  );
}

function ApplicationCard({ application }) {
  const statusClassName = statusClassNames[application.status] || "pending";

  return (
    <article className="application-card">
      <div className="application-company-logo">
        {application.company.charAt(0).toUpperCase()}
      </div>

      <div className="application-card-details">
        <div className="application-card-heading">
          <div>
            <h3>{application.jobTitle}</h3>
            <p>{application.company}</p>
          </div>
          <span className={`application-status ${statusClassName}`}>
            {application.status}
          </span>
        </div>

        <div className="application-meta">
          <span>📍 {application.location}</span>
          <span>💼 {application.jobType}</span>
        </div>

        <div className="application-dates">
          <span><strong>Applied:</strong> {application.appliedDate}</span>
          <span><strong>Last updated:</strong> {application.lastUpdated}</span>
        </div>
      </div>

      <div className="application-card-actions">
        <Link
          to={`/candidate/jobs/${application.jobId}`}
          className="application-view-job"
        >
          View Job →
        </Link>
        <Link
          to={`/candidate/applications/${application.id}`}
          className="application-view-button"
        >
          View Application
        </Link>
      </div>
    </article>
  );
}

export default Applications;
