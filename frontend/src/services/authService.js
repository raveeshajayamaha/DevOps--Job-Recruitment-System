const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const TOKEN_KEY = 'jobrecruit.token';

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function dashboardFor(role) {
  const dashboards = {
    candidate: '/candidate/dashboard',
    recruiter: '/recruiter/dashboard',
    admin: '/admin/dashboard',
  };
  return dashboards[role] || '/login';
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(API_URL + path, options);
  } catch {
    throw new Error('Cannot reach the backend. Check that it is running on port 5000.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Authentication request failed');
    error.status = response.status;
    throw error;
  }
  return data;
}

export function register(details) {
  return request('/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(details),
  });
}

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  sessionStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
}

export function currentUser(signal) {
  return request('/auth/me', {
    headers: { Authorization: 'Bearer ' + getToken() }, signal,
  });
}
