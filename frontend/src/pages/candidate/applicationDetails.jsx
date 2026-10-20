import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import CandidateLayout from "./candidateLayout";
import { getApplicationById } from "../../services/applicationService";
import "./applications.css";

function CandidateApplicationDetails() {
  const { applicationId } = useParams();
  const [result, setResult] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    getApplicationById(applicationId, controller.signal)
      .then(application => setResult({ applicationId, application }))
      .catch(error => { if (!controller.signal.aborted) setResult({ applicationId, error }); });
    return () => controller.abort();
  }, [applicationId]);
  const loading = !result || result.applicationId !== applicationId;
  const application = loading ? null : result.application;
  const loadError = !loading && result.error;
  const statusClassName = application?.status
    ? application.status.toLowerCase().replace(/\s+/g, "-")
    : "pending";

  return (
    <CandidateLayout
      title="Application Details"
      eyebrow="Candidate applications"
    >
      {loading ? <p role="status">Loading application...</p> : !application ? (
        <section className="candidate-card applications-empty-state" role="alert">
          <h3>{loadError?.status === 404 ? "Application not found." : "Unable to load application."}</h3>
          <p>{loadError?.message || "The requested application could not be found."}</p>
          <Link className="application-view-job" to="/candidate/applications">
            Back to Applications
          </Link>
        </section>
      ) : (
        <section className="candidate-card application-list-card">
          <Link className="post-job-back-link" to="/candidate/applications">
            ← Back to Applications
          </Link>
          <div className="application-card-heading">
            <div>
              <h2>{application.jobTitle}</h2>
              <p>{application.company}</p>
            </div>
            <span className={`application-status ${statusClassName}`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
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
        </section>
      )}
    </CandidateLayout>
  );
}

export default CandidateApplicationDetails;
