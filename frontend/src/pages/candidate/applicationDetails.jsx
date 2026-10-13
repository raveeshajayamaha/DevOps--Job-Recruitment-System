import { Link, useParams } from "react-router-dom";
import CandidateLayout from "./candidateLayout";
import applications from "../../data/applications";
import "./applications.css";

function CandidateApplicationDetails() {
  const { applicationId } = useParams();
  const normalizedApplicationId = String(applicationId ?? "").trim();
  const application = applications.find(
    (currentApplication) =>
      String(currentApplication.id).trim() === normalizedApplicationId,
  );
  const statusClassName = application?.status
    ? application.status.toLowerCase().replace(/\s+/g, "-")
    : "pending";

  return (
    <CandidateLayout
      title="Application Details"
      eyebrow="Candidate applications"
    >
      {!application ? (
        <section className="candidate-card applications-empty-state" role="alert">
          <h3>Application not found.</h3>
          <p>The requested application could not be found.</p>
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
        </section>
      )}
    </CandidateLayout>
  );
}

export default CandidateApplicationDetails;
