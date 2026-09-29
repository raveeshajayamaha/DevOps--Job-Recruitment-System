import { Link, useParams } from "react-router-dom";
import jobs from "../../data/jobs";
import "./jobDetails.css";


function JobDetails() {

  const { jobId } = useParams();

  // Find the selected job using the ID from the URL
  const job = jobs.find(
    (job) => job.id === Number(jobId)
  );


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

          <h2>Job Not Found</h2>

          <p>
            The job you are looking for does not exist.
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

        <button className="apply-button">
          Apply Now
        </button>

      </div>

    </div>

  );
}


export default JobDetails;