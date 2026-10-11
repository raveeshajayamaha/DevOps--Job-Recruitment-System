import recruiterJobs from "../data/recruiterJobs";

let jobs = recruiterJobs;

function getJobs() {
  return jobs.map((job) => ({ ...job, requirements: [...job.requirements], skills: [...job.skills] }));
}

function getJobById(id) {
  return getJobs().find((job) => String(job.id) === String(id));
}

function createJob(jobData) {
  const newJob = {
    ...jobData,
    id: jobData.id ?? getNextJobId(),
    status: jobData.status ?? "active",
    applicantsCount: jobData.applicantsCount ?? 0,
    requirements: [...(jobData.requirements ?? [])],
    skills: [...(jobData.skills ?? [])],
  };

  jobs = [...jobs, newJob];
  return { ...newJob, requirements: [...newJob.requirements], skills: [...newJob.skills] };
}

function updateJob(id, updatedData) {
  const job = getJobById(id);

  if (!job) {
    return undefined;
  }

  const updatedJob = { ...job, ...updatedData, id: job.id };
  jobs = jobs.map((currentJob) => (currentJob.id === job.id ? updatedJob : currentJob));
  return { ...updatedJob, requirements: [...updatedJob.requirements], skills: [...updatedJob.skills] };
}

function deleteJob(id) {
  const job = getJobById(id);

  if (!job) {
    return false;
  }

  jobs = jobs.filter((currentJob) => currentJob.id !== job.id);
  return true;
}

function updateJobStatus(id, status) {
  return updateJob(id, { status });
}

function getNextJobId() {
  return jobs.reduce((highestId, job) => Math.max(highestId, Number(job.id) || 0), 0) + 1;
}

export {
  createJob,
  deleteJob,
  getJobById,
  getJobs,
  updateJob,
  updateJobStatus,
};
