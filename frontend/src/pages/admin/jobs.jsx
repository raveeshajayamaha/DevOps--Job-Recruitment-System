import { useEffect, useMemo, useRef, useState } from "react";
import sampleJobs from "../../data/recruiterJobs";
import AdminSidebar from "./AdminSidebar";
import { useAdminTheme } from "./AdminThemeContext";
import "./dashboard.css";
import "./jobs.css";

const PAGE_SIZE = 5;
const statuses = [...new Set(sampleJobs.map((job) => job.status))];
const jobTypes = [...new Set(sampleJobs.map((job) => job.jobType))];

function formatDate(value, options = { year: "numeric", month: "short", day: "numeric" }) {
  if (!value) return "Not provided";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en", options);
}

function AdminJobs() {
  const { theme } = useAdminTheme();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All statuses");
  const [jobType, setJobType] = useState("All types");
  const [page, setPage] = useState(1);
  const [selectedJob, setSelectedJob] = useState(null);
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!selectedJob) return undefined;
    modalRef.current?.focus();
    const handleKeyDown = (event) => { if (event.key === "Escape") setSelectedJob(null); };
    document.addEventListener("keydown", handleKeyDown);
    return () => { document.removeEventListener("keydown", handleKeyDown); triggerRef.current?.focus(); };
  }, [selectedJob]);

  const summary = useMemo(() => ({
    total: sampleJobs.length,
    active: sampleJobs.filter((job) => job.status === "active").length,
    pending: sampleJobs.filter((job) => job.status === "pending").length,
    closed: sampleJobs.filter((job) => job.status === "closed").length,
  }), []);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sampleJobs.filter((job) => (
      (!query || job.title.toLowerCase().includes(query) || job.company.toLowerCase().includes(query))
      && (status === "All statuses" || job.status === status)
      && (jobType === "All types" || job.jobType === jobType)
    ));
  }, [search, status, jobType]);
  const pageCount = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const visibleJobs = filteredJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const updateFilter = (setter, value) => { setter(value); setPage(1); };

  return <div className="admin-dashboard" data-admin-theme={theme}>
    <AdminSidebar />
    <main className="admin-main">
      <header className="admin-topbar"><div className="admin-breadcrumb"><span>Workspace</span><span className="admin-breadcrumb-separator">/</span><strong>Job Management</strong></div><div className="admin-topbar-right"><span className="admin-demo-badge"><span/> Demo data</span><div className="admin-avatar" aria-label="Admin profile">AD</div></div></header>
      <div className="admin-content">
        <section className="admin-welcome"><div><p className="admin-eyebrow">ADMINISTRATION</p><h1>Job Management</h1><p className="admin-welcome-copy">Review job postings from the local recruiter sample dataset.</p></div></section>
        <div className="admin-sample-notice" role="note"><span className="admin-notice-icon" aria-hidden="true">i</span><span><strong>Local sample data</strong> — postings are in-memory demo records and are not connected to a backend or database.</span></div>
        <section className="admin-overview-grid admin-jobs-summary" aria-label="Sample job statistics">
          {[["Total Jobs", summary.total, "blue"], ["Active Jobs", summary.active, "teal"], ["Pending Review", summary.pending, "amber"], ["Closed Jobs", summary.closed, "violet"]].map(([label, value, tone]) => <article className="admin-stat-card" key={label}><div className={`admin-stat-icon ${tone}`} aria-hidden="true">{label === "Active Jobs" ? "A" : label === "Closed Jobs" ? "C" : "J"}</div><div className="admin-stat-content"><span className="admin-stat-label">{label}</span><strong className="admin-stat-value">{value}</strong><span className="admin-jobs-caption">Local sample records</span></div></article>)}
        </section>
        <section className="admin-panel admin-jobs-panel" aria-labelledby="admin-jobs-list-title">
          <div className="admin-panel-heading"><div><h2 id="admin-jobs-list-title">Job postings</h2><p>Search and filter the local recruiter dataset.</p></div></div>
          <div className="admin-jobs-filters">
            <label className="admin-jobs-search"><span className="admin-sr-only">Search job title or company</span><span aria-hidden="true">⌕</span><input type="search" placeholder="Search job title or company" value={search} onChange={(event) => updateFilter(setSearch, event.target.value)}/></label>
            <label className="admin-jobs-select"><span>Job status</span><select value={status} onChange={(event) => updateFilter(setStatus, event.target.value)}><option>All statuses</option>{statuses.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
            <label className="admin-jobs-select"><span>Job type</span><select value={jobType} onChange={(event) => updateFilter(setJobType, event.target.value)}><option>All types</option>{jobTypes.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
          </div>
          {visibleJobs.length ? <>
            <div className="admin-jobs-table-wrap"><table className="admin-jobs-table"><thead><tr><th>Job title</th><th>Company</th><th>Location</th><th>Job type</th><th>Status</th><th>Applicants</th><th>Posted date</th><th><span className="admin-sr-only">Actions</span></th></tr></thead><tbody>{visibleJobs.map((job) => <tr key={job.id}><td><strong className="admin-job-title">{job.title}</strong></td><td>{job.company}</td><td>{job.location}</td><td>{job.jobType}</td><td><span className={`admin-job-status ${job.status}`}><span/>{job.status}</span></td><td>{job.applicantsCount}</td><td><time dateTime={job.postedDate}>{formatDate(job.postedDate)}</time></td><td><button className="admin-job-view" type="button" onClick={(event) => { triggerRef.current = event.currentTarget; setSelectedJob(job); }}>View details</button></td></tr>)}</tbody></table></div>
            <div className="admin-jobs-pagination"><span>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filteredJobs.length)} of {filteredJobs.length} sample jobs</span><div><button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Previous</button><span>Page {page} of {pageCount}</span><button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount}>Next</button></div></div>
          </> : <div className="admin-jobs-empty"><span aria-hidden="true">⌕</span><h3>No jobs found</h3><p>Try another title, company, status, or job type.</p></div>}
        </section>
        <footer className="admin-footer">© 2026 JobRecruit <span>•</span> Admin job management preview</footer>
      </div>
    </main>
    {selectedJob && <div className="admin-job-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedJob(null); }}><section ref={modalRef} tabIndex={-1} className="admin-job-modal" role="dialog" aria-modal="true" aria-labelledby="admin-job-modal-title"><button className="admin-job-modal-close" type="button" onClick={() => setSelectedJob(null)} aria-label="Close details">×</button><p className="admin-eyebrow">LOCAL SAMPLE JOB</p><h2 id="admin-job-modal-title">{selectedJob.title}</h2><p className="admin-job-modal-company">{selectedJob.company} · {selectedJob.location}</p><p className="admin-job-modal-description">{selectedJob.description}</p><dl><div><dt>Job type</dt><dd>{selectedJob.jobType}</dd></div><div><dt>Status</dt><dd>{selectedJob.status}</dd></div><div><dt>Applicants</dt><dd>{selectedJob.applicantsCount}</dd></div><div><dt>Posted</dt><dd>{formatDate(selectedJob.postedDate, { year: "numeric", month: "long", day: "numeric" })}</dd></div><div><dt>Experience</dt><dd>{selectedJob.experienceLevel}</dd></div><div><dt>Deadline</dt><dd>{formatDate(selectedJob.deadline, { year: "numeric", month: "long", day: "numeric" })}</dd></div><div><dt>Skills</dt><dd>{selectedJob.skills.join(", ")}</dd></div></dl><h3>Requirements</h3><ul>{selectedJob.requirements.map((item) => <li key={item}>{item}</li>)}</ul><button className="admin-job-modal-done" type="button" onClick={() => setSelectedJob(null)}>Close</button></section></div>}
  </div>;
}

export default AdminJobs;
