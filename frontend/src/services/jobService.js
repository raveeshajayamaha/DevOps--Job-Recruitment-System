import { getToken, logout } from './authService';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const editableFields = ['title', 'company', 'location', 'jobType', 'salaryMin', 'salaryMax', 'experienceLevel', 'description', 'requirements', 'skills', 'deadline', 'status'];
function payload(data) {
  return Object.fromEntries(editableFields.filter(key => Object.hasOwn(data, key)).map(key => [key, data[key]]));
}
function normalize(job) {
  return {
    ...job,
    id: job.id || job._id,
    type: ({ 'Full-time': 'Full Time', 'Part-time': 'Part Time' })[job.jobType] || job.jobType,
    salary: `Rs. ${job.salaryMin / 1000}K - ${job.salaryMax / 1000}K`,
  };
}
async function request(path, { method = 'GET', body, signal } = {}) {
  const token = getToken();
  if (!token) {
    const error = new Error('Please log in to continue.');
    error.status = 401;
    window.location.assign('/login');
    throw error;
  }
  let response;
  try {
    response = await fetch(API_URL + '/jobs' + path, {
      method, signal,
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Cannot reach the backend. Check that it is running on port 5000.', { cause: error });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    if (response.status === 401 && getToken() === token) {
      logout();
      window.location.assign('/login');
    }
    const error = new Error(response.status >= 500 ? 'Unable to complete the job request. Please try again later.' : data.message || 'Unable to complete the job request.');
    error.status = response.status;
    throw error;
  }
  return data;
}
export async function getJobs(filters = {}, signal) {
  const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value && value !== 'All Types'));
  const data = await request(`?${query}`, { signal });
  return data.jobs.map(normalize);
}
export async function getMyJobs(signal) {
  const data = await request('/my', { signal });
  return data.jobs.map(normalize);
}
export async function getJobById(id, signal) {
  const data = await request('/' + encodeURIComponent(id), { signal });
  return normalize(data.job);
}
export async function createJob(data) {
  return normalize((await request('', { method: 'POST', body: payload(data) })).job);
}
export async function updateJob(id, data) {
  return normalize((await request('/' + encodeURIComponent(id), { method: 'PUT', body: payload(data) })).job);
}
export function deleteJob(id) {
  return request('/' + encodeURIComponent(id), { method: 'DELETE' });
}
export async function updateJobStatus(id, status) {
  return normalize((await request('/' + encodeURIComponent(id) + '/status', { method: 'PATCH', body: { status } })).job);
}
