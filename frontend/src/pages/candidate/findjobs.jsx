import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getJobs } from "../../services/jobService";

import "./findjobs.css";

function FindJobs() {
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get("search") || "";
  const [search, setSearch] = useState(querySearch);
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("All Types");

  const [result, setResult] = useState(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      getJobs({ search, location, jobType }, controller.signal)
        .then(jobs => setResult({ search, location, jobType, jobs }))
        .catch(error => {
          if (!controller.signal.aborted) setResult({ search, location, jobType, error });
        });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search, location, jobType]);
  const loading = !result || result.search !== search || result.location !== location || result.jobType !== jobType;
  const error = !loading && result.error;
  const filteredJobs = loading || error ? [] : result.jobs;

  return (
    <div className="find-jobs-page">

      {/* Header */}
      <div className="find-jobs-header">

        <div>
          <h1>Find Your Next Job</h1>
          <p>
            Discover opportunities that match your skills and career goals.
          </p>
        </div>

        <Link to="/candidate/dashboard" className="back-dashboard">
          ← Dashboard
        </Link>

      </div>


      {/* Search Section */}
      <div className="job-search-section">

        <div className="search-field">
          <label>Search Jobs</label>

          <input
            type="text"
            placeholder="Job title or company"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>


        <div className="search-field">
          <label>Location</label>

          <input
            type="text"
            placeholder="e.g. Colombo"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>


        <div className="search-field">
          <label>Job Type</label>

          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option>All Types</option>
            <option>Full Time</option>
            <option>Part Time</option>
            <option>Hybrid</option>
            <option>Remote</option>
          </select>
        </div>

      </div>


      {/* Available Jobs */}
      <div className="available-jobs">

        <div className="jobs-heading">
          <div>
            <h2>Available Jobs</h2>
            <p>{loading ? "Loading jobs..." : `${filteredJobs.length} jobs found`}</p>
          </div>
        </div>


        {/* Job Cards */}
        <div className="job-list">

          {loading ? <p role="status">Loading jobs...</p> : error ? <p role="alert">{error.message}</p> : filteredJobs.length > 0 ? (

            filteredJobs.map((job) => (

              <div className="job-card" key={job.id}>

                <div className="job-icon">
                  {job.title.charAt(0)}
                </div>


                <div className="job-info">

                  <h3>{job.title}</h3>

                  <p className="company-name">
                    {job.company}
                  </p>

                  <div className="job-meta">

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

                </div>


                <Link
                  to={`/candidate/jobs/${job.id}`}
                  className="view-job-button"
                >
                  View Job →
                </Link>

              </div>

            ))

          ) : (

            <div className="no-jobs">
              <h3>No jobs found</h3>

              <p>
                Try changing your search or filter options.
              </p>
            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default FindJobs;