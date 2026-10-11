import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CandidateLayout from "./candidateLayout";
import interviews from "../../data/interviews";
import "./interviews.css";

const filterOptions = ["All", "Upcoming", "Completed", "Cancelled"];

const statusClassNames = {
  Upcoming: "upcoming",
  Completed: "completed",
  Cancelled: "cancelled",
};

function InterviewsPage() {
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredInterviews = useMemo(
    () =>
      interviews.filter(
        (interview) =>
          statusFilter === "All" || interview.status === statusFilter
      ),
    [statusFilter]
  );

  const getStatusCount = (status) =>
    interviews.filter((interview) => interview.status === status).length;

  return (
    <CandidateLayout
      title="Interviews"
      eyebrow="Candidate interviews"
    >
      <div className="interviews-page-content">
        <p className="interviews-subtitle">
          Manage and keep track of your upcoming and previous job interviews.
        </p>

        <section className="interview-summary-grid" aria-label="Interview summary">
          <SummaryCard label="Total Interviews" value={interviews.length} />
          <SummaryCard label="Upcoming" value={getStatusCount("Upcoming")} />
          <SummaryCard label="Completed" value={getStatusCount("Completed")} />
          <SummaryCard label="Cancelled" value={getStatusCount("Cancelled")} />
        </section>

        <section className="candidate-card interview-list-card">
          <div className="interviews-toolbar">
            <div>
              <h2>Interview schedule</h2>
              <p>
                {filteredInterviews.length} interview
                {filteredInterviews.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <label className="interview-filter">
              Filter interviews
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                {filterOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filteredInterviews.length === 0 ? (
            <div className="interviews-empty-state">
              <div className="interview-empty-icon">📅</div>
              <h3>No interviews found.</h3>
              <p>There are no interviews matching this filter.</p>
            </div>
          ) : (
            <div className="interview-list">
              {filteredInterviews.map((interview) => (
                <InterviewCard interview={interview} key={interview.id} />
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
    <div className="interview-summary-card">
      <span className="interview-summary-value">{value}</span>
      <span className="interview-summary-label">{label}</span>
    </div>
  );
}

function InterviewCard({ interview }) {
  const statusClassName = statusClassNames[interview.status] || "upcoming";

  return (
    <article className="interview-card">
      <div className="interview-type-icon" aria-hidden="true">
        {interview.mode === "Online" ? "🎥" : "📍"}
      </div>

      <div className="interview-card-details">
        <div className="interview-card-heading">
          <div>
            <h3>{interview.jobTitle}</h3>
            <p>{interview.company}</p>
          </div>
          <span className={`interview-status ${statusClassName}`}>
            {interview.status}
          </span>
        </div>

        <div className="interview-information">
          <span><strong>Type:</strong> {interview.interviewType}</span>
          <span><strong>Date:</strong> {interview.date}</span>
          <span><strong>Time:</strong> {interview.time}</span>
          <span>
            <strong>{interview.mode === "Online" ? "Online Interview" : "On-site Interview"}:</strong>{" "}
            {interview.location}
          </span>
          <span><strong>Interviewer:</strong> {interview.interviewer}</span>
        </div>

        {interview.notes && (
          <p className="interview-notes">
            <strong>Notes:</strong> {interview.notes}
          </p>
        )}
      </div>

      <div className="interview-card-actions">
        <Link
          to={`/candidate/jobs/${interview.jobId}`}
          className="interview-view-job"
        >
          View Job →
        </Link>
      </div>
    </article>
  );
}

export default InterviewsPage;
