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
    response = await fetch(API_URL + '/interviews' + path, {
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
    const error = new Error(response.status >= 500 ? 'Unable to complete the interview request. Please try again later.' : data.message || 'Unable to complete the interview request.');
    error.status = response.status;
    throw error;
  }
  return data;
}
export async function getInterviews(signal) {
  return (await request('/recruiter', { signal })).interviews;
}
export async function getMyInterviews(signal) {
  const items = (await request('/my', { signal })).interviews;
  return items.map(item => ({ ...item,
    status: { scheduled: 'Upcoming', completed: 'Completed', cancelled: 'Cancelled' }[item.status],
    date: item.interviewDate, time: item.interviewTime,
    mode: item.interviewType === 'In-person' ? 'On-site' : 'Online',
    location: item.interviewType === 'Video Call' ? item.meetingLink : item.interviewType === 'Phone Call' ? 'Phone call' : item.location,
  }));
}
export async function getInterviewById(id, signal) {
  return (await request('/' + encodeURIComponent(id), { signal })).interview;
}
export async function getInterviewsByApplicationId(id, signal) {
  return (await request('/recruiter?applicationId=' + encodeURIComponent(id), { signal })).interviews;
}
export async function createInterview(body) {
  return (await request('', { method: 'POST', body })).interview;
}
export async function updateInterview(id, updates) {
  if (Object.keys(updates).length === 1 && 'status' in updates) return updateInterviewStatus(id, updates.status);
  return (await request('/' + encodeURIComponent(id), { method: 'PATCH', body: updates })).interview;
}
export async function updateInterviewStatus(id, status) {
  return (await request('/' + encodeURIComponent(id) + '/status', { method: 'PATCH', body: { status } })).interview;
}
