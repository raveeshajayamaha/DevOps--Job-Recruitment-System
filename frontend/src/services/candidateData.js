import jobs from "../data/jobs";
import interviews from "../data/interviews";
import applications from "../data/applications";
import resources from "../data/resources";

export function filterJobs(searchTerm = "") {
  const normalized = searchTerm.trim().toLowerCase();

  if (!normalized) {
    return jobs;
  }

  return jobs.filter((job) => {
    const searchableText = [
      job.title,
      job.company,
      job.location,
      job.type,
      job.description,
      job.requirements.join(" "),
      job.skills.join(" ")
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalized);
  });
}

export function getRecommendedJobs(limit = 3) {
  return jobs.slice(0, limit);
}

export function getInterviews() {
  return interviews;
}

export function getApplications() {
  return applications;
}

export function getResources() {
  return resources;
}

export default {
  filterJobs,
  getRecommendedJobs,
  getInterviews,
  getApplications,
  getResources
};
