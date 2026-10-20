import { getToken, logout } from './authService';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
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
    response = await fetch(API_URL + '/applications' + path, {
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
    const error = new Error(response.status >= 500 ? 'Unable to complete the application request. Please try again later.' : data.message || 'Unable to complete the application request.');
    error.status = response.status;
    throw error;
  }
  return data;
}
export async function createApplication(jobId) {
  return (await request('', { method: 'POST', body: { jobId } })).application;
}
export async function getMyApplications(signal) {
  return (await request('/my', { signal })).applications;
}
export async function getRecruiterApplications(signal) {
  return (await request('/recruiter', { signal })).applications;
}
export async function getApplicationById(id, signal) {
  return (await request('/' + encodeURIComponent(id), { signal })).application;
}
export async function updateApplicationStatus(id, status) {
  return (await request('/' + encodeURIComponent(id) + '/status', { method: 'PATCH', body: { status } })).application;
}
