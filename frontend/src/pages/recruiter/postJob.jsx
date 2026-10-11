import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { createJob } from "../../services/jobService";
import "./postJob.css";

const initialForm = {
  title: "",
  company: "",
  location: "",
  type: "Full Time",
  salaryMinimum: "",
  salaryMaximum: "",
  experienceLevel: "Entry Level",
  description: "",
  requirements: "",
  skills: "",
  deadline: "",
};

function PostJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submittedJob, setSubmittedJob] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));

    setErrors((currentErrors) => {
      if (!currentErrors[name]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[name];
      return nextErrors;
    });

    setSubmittedJob(null);
  };

  const validateForm = () => {
    const nextErrors = {};
    const minimumSalary = form.salaryMinimum.trim();
    const maximumSalary = form.salaryMaximum.trim();

    if (!form.title.trim()) {
      nextErrors.title = "Job title is required.";
    }

    if (!form.company.trim()) {
      nextErrors.company = "Company name is required.";
    }

    if (!form.location.trim()) {
      nextErrors.location = "Location is required.";
    }

    if (!form.type) {
      nextErrors.type = "Job type is required.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Please provide a job description.";
    }

    if (!form.requirements.trim()) {
      nextErrors.requirements = "Please provide the job requirements.";
    }

    if (!form.deadline) {
      nextErrors.deadline = "Application deadline is required.";
    } else if (Number.isNaN(new Date(`${form.deadline}T00:00:00`).getTime())) {
      nextErrors.deadline = "Please provide a valid application deadline.";
    }

    if (minimumSalary && !isValidSalary(minimumSalary)) {
      nextErrors.salaryMinimum = "Minimum salary must be a valid number.";
    }

    if (maximumSalary && !isValidSalary(maximumSalary)) {
      nextErrors.salaryMaximum = "Maximum salary must be a valid number.";
    }

    if (
      minimumSalary &&
      maximumSalary &&
      isValidSalary(minimumSalary) &&
      isValidSalary(maximumSalary) &&
      Number(minimumSalary) > Number(maximumSalary)
    ) {
      nextErrors.salaryMaximum =
        "Maximum salary must be greater than or equal to minimum salary.";
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = validateForm();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmittedJob(null);
      return;
    }

    const job = createJob({
      title: form.title.trim(),
      company: form.company.trim(),
      location: form.location.trim(),
      jobType: form.type === "Full Time" ? "Full-time" : form.type,
      salaryMin: form.salaryMinimum ? Number(form.salaryMinimum) : 0,
      salaryMax: form.salaryMaximum ? Number(form.salaryMaximum) : 0,
      experienceLevel: form.experienceLevel,
      description: form.description.trim(),
      requirements: splitList(form.requirements),
      skills: splitList(form.skills),
      status: "active",
      applicantsCount: 0,
      postedDate: new Date().toISOString().slice(0, 10),
      deadline: form.deadline,
    });

    setSubmittedJob(job);
  };

  return (
    <div className="post-job-page">
      <RecruiterSidebar />

      <main className="post-job-main">
        <header className="post-job-header">
          <div>
            <p className="post-job-eyebrow">Recruiter workspace</p>
            <h1>Post a New Job</h1>
            <p className="post-job-header-description">
              Create a new job posting and attract qualified candidates.
            </p>
          </div>

          <div className="post-job-header-actions">
            <button
              aria-label="Notifications"
              className="post-job-icon-button"
              type="button"
            >
              🔔<span>3</span>
            </button>
            <div className="post-job-avatar">AR</div>
            <div className="post-job-profile-label">
              <strong>Alex R.</strong>
              <span>Hiring Manager</span>
            </div>
          </div>
        </header>

        <div className="post-job-content">
          <NavLink className="post-job-back-link" to="/recruiter/dashboard">
            ← Back to Dashboard
          </NavLink>

          <form className="post-job-card" onSubmit={handleSubmit} noValidate>
            <div className="post-job-card-header">
              <div>
                <h2>Job Information</h2>
                <p>Share the details candidates need to understand the role.</p>
              </div>
              <span className="post-job-required-note">* Required fields</span>
            </div>

            <div className="post-job-form-grid">
              <FormField
                error={errors.title}
                htmlFor="job-title"
                label="Job Title"
                required
              >
                <input
                  id="job-title"
                  name="title"
                  onChange={handleChange}
                  placeholder="e.g. Senior Frontend Developer"
                  value={form.title}
                />
              </FormField>

              <FormField
                error={errors.company}
                htmlFor="company"
                label="Company"
                required
              >
                <input
                  id="company"
                  name="company"
                  onChange={handleChange}
                  placeholder="e.g. Tech Solutions Ltd."
                  value={form.company}
                />
              </FormField>

              <FormField
                error={errors.location}
                htmlFor="location"
                label="Location"
                required
              >
                <input
                  id="location"
                  name="location"
                  onChange={handleChange}
                  placeholder="e.g. Colombo or Remote"
                  value={form.location}
                />
              </FormField>

              <FormField error={errors.type} htmlFor="job-type" label="Job Type" required>
                <select id="job-type" name="type" onChange={handleChange} value={form.type}>
                  <option value="Full Time">Full-time</option>
                  <option value="Part Time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </FormField>

              <div className="post-job-field post-job-salary-field">
                <span className="post-job-label">Salary Range</span>
                <div className="post-job-salary-grid">
                  <FormField error={errors.salaryMinimum} htmlFor="salary-minimum" label="Minimum">
                    <input
                      id="salary-minimum"
                      min="0"
                      name="salaryMinimum"
                      onChange={handleChange}
                      placeholder="e.g. 100000"
                      type="number"
                      value={form.salaryMinimum}
                    />
                  </FormField>
                  <FormField error={errors.salaryMaximum} htmlFor="salary-maximum" label="Maximum">
                    <input
                      id="salary-maximum"
                      min="0"
                      name="salaryMaximum"
                      onChange={handleChange}
                      placeholder="e.g. 180000"
                      type="number"
                      value={form.salaryMaximum}
                    />
                  </FormField>
                </div>
              </div>

              <FormField
                error={errors.experienceLevel}
                htmlFor="experience-level"
                label="Experience Level"
              >
                <select
                  id="experience-level"
                  name="experienceLevel"
                  onChange={handleChange}
                  value={form.experienceLevel}
                >
                  <option>Entry Level</option>
                  <option>Mid Level</option>
                  <option>Senior Level</option>
                </select>
              </FormField>

              <FormField
                className="post-job-full-width"
                error={errors.description}
                htmlFor="description"
                label="Job Description"
                required
              >
                <textarea
                  id="description"
                  name="description"
                  onChange={handleChange}
                  placeholder="Describe the role, responsibilities and what success looks like."
                  rows="6"
                  value={form.description}
                />
              </FormField>

              <FormField
                className="post-job-full-width"
                error={errors.requirements}
                htmlFor="requirements"
                label="Requirements"
                required
              >
                <textarea
                  id="requirements"
                  name="requirements"
                  onChange={handleChange}
                  placeholder="Add the qualifications and experience candidates should have."
                  rows="6"
                  value={form.requirements}
                />
                <span className="post-job-help-text">
                  Separate multiple requirements with commas or new lines.
                </span>
              </FormField>

              <FormField
                className="post-job-full-width"
                error={errors.skills}
                htmlFor="skills"
                label="Required Skills"
              >
                <input
                  id="skills"
                  name="skills"
                  onChange={handleChange}
                  placeholder="e.g. React, Node.js, MongoDB"
                  value={form.skills}
                />
                <span className="post-job-help-text">
                  Separate skills with commas.
                </span>
              </FormField>

              <FormField
                error={errors.deadline}
                htmlFor="deadline"
                label="Application Deadline"
                required
              >
                <input
                  id="deadline"
                  name="deadline"
                  onChange={handleChange}
                  type="date"
                  value={form.deadline}
                />
              </FormField>
            </div>

            {submittedJob && (
              <div className="post-job-success" role="status">
                <strong>Job posted successfully!</strong>
                <span>
                  {submittedJob.title} is ready for candidates to discover.
                </span>
                <NavLink to="/recruiter/dashboard">Back to Recruiter Dashboard</NavLink>
              </div>
            )}

            <div className="post-job-actions">
              <button
                className="post-job-secondary-button"
                onClick={() => navigate("/recruiter/dashboard")}
                type="button"
              >
                Cancel
              </button>
              <button className="post-job-primary-button" type="submit">
                Publish Job
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

function RecruiterSidebar() {
  const sidebarItems = [
    { label: "Dashboard", icon: "⌂", to: "/recruiter/dashboard", end: true },
    { label: "Post Job", icon: "+", to: "/recruiter/jobs/new", end: true },
    { label: "Manage Jobs", icon: "▣", to: "/recruiter/jobs", end: true },
    { label: "Applications", icon: "✓", to: "/recruiter/applications" },
    { label: "Interviews", icon: "◷", to: "/recruiter/interviews" },
    { label: "Profile", icon: "◎", to: "/recruiter/profile" },
    { label: "Settings", icon: "⚙", to: "/recruiter/settings" },
  ];

  return (
    <aside className="post-job-sidebar">
      <div className="post-job-brand">
        <div className="post-job-brand-logo">💼</div>
        <div>
          <strong>JobRecruit</strong>
          <span>Recruiter Portal</span>
        </div>
      </div>

      <nav className="post-job-navigation" aria-label="Recruiter navigation">
        {sidebarItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `post-job-nav-link${isActive ? " active" : ""}`
            }
            end={item.end}
            key={item.label}
            to={item.to}
          >
            <span className="post-job-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="post-job-sidebar-footer">
        <NavLink className="post-job-nav-link" to="/">
          <span className="post-job-nav-icon">↪</span>
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
}

function FormField({ children, className = "", error, htmlFor, label, required = false }) {
  return (
    <div className={`post-job-field ${className}`}>
      <label className="post-job-label" htmlFor={htmlFor}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && <span className="post-job-error">{error}</span>}
    </div>
  );
}

function isValidSalary(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 0;
}

function splitList(value) {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default PostJob;
