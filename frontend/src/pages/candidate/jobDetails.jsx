import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getJobById } from "../../services/jobService";
import { createApplication } from "../../services/applicationService";
import { useRef } from "react";
import "./jobDetails.css";


function JobDetails() {

  const { jobId } = useParams();

  const applying = useRef(false);
  const [submission, setSubmission] = useState(null);
  const currentSubmission = submission?.jobId === jobId ? submission : null;
  const applyNow = async () => {
    if (applying.current || currentSubmission?.applied) return;
    applying.current = true;
    setSubmission({ jobId, pending: true });
    try {
      await createApplication(jobId);
      setSubmission({ jobId, applied: true, message: "Application submitted successfully." });
    } catch (error) {
      setSubmission({ jobId, applied: error.status === 409, error: true, message: error.message });
    } finally { applying.current = false; }
  };
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
  const error = !loading && result.error;

  // If job does not exist
  if (!job) {
    return (
      <div className="job-details-page">

        <Link
          to="/candidate/jobs"
          className="back-button"
        >
          ← Back to Jobs
        </Link>

        <div className="job-section">

          <h2>{loading ? "Loading job..." : error?.status === 404 ? "Job Not Found" : "Unable to load job"}</h2>

          <p>
            {loading ? "Please wait while we load the job." : error?.message || "The job you are looking for does not exist."}
          </p>

        </div>

      </div>
    );
  }


  return (

    <div className="job-details-page">

      {/* Back Button */}

      <Link
        to="/candidate/jobs"
        className="back-button"
      >
        ← Back to Jobs
      </Link>


      {/* Job Header */}

      <div className="job-details-header">

        <div className="job-company-logo">
          {job.title.charAt(0)}
        </div>

        <div>

          <h1>
            {job.title}
          </h1>

          <p>
            {job.company}
          </p>

        </div>

      </div>


      {/* Job Information */}

      <div className="job-info">

        <span>
          📍 {job.location}
        </span>

        <span>
          💼 {job.type}
        </span>

        <span>
          💰 {job.salary}
        </span>

      </div>


      {/* About Job */}

      <section className="job-section">

        <h2>
          About the Job
        </h2>

        <p>
          {job.description}
        </p>

      </section>


      {/* Requirements */}

      <section className="job-section">

        <h2>
          Requirements
        </h2>

        <ul>

          {job.requirements.map(
            (requirement, index) => (

              <li key={index}>
                {requirement}
              </li>

            )
          )}

        </ul>

      </section>


      {/* Skills */}

      <section className="job-section">

        <h2>
          Skills
        </h2>

        <div className="skills">

          {job.skills.map(
            (skill, index) => (

              <span key={index}>
                {skill}
              </span>

            )
          )}

        </div>

      </section>


      {/* Apply */}

      <div className="apply-section">

        <button className="apply-button" onClick={applyNow} disabled={currentSubmission?.pending || currentSubmission?.applied}>
          {currentSubmission?.pending ? "Applying..." : currentSubmission?.applied ? "Applied" : "Apply Now"}
        </button>
        {currentSubmission?.message && <p role={currentSubmission.error ? "alert" : "status"}>{currentSubmission.message}</p>}

      </div>

    </div>

  );
}


export default JobDetails;