import { useState } from "react";
import { Link } from "react-router-dom";
import { jobs } from "../../data/jobs";

import "./findjobs.css";

function FindJobs() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("All Types");

  const filteredJobs = jobs.filter((job) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      job.title.toLowerCase().includes(searchText) ||
      job.company.toLowerCase().includes(searchText);

    const matchesLocation =
      location === "" ||
      job.location.toLowerCase().includes(location.toLowerCase());

    const matchesType =
      jobType === "All Types" || job.type === jobType;

    return matchesSearch && matchesLocation && matchesType;
  });

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
            <p>{filteredJobs.length} jobs found</p>
          </div>
        </div>


        {/* Job Cards */}
        <div className="job-list">

          {filteredJobs.length > 0 ? (

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