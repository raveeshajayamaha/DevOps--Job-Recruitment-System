const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const TOKEN_KEY = 'jobrecruit.token';

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function logout(event) {
  sessionStorage.removeItem(TOKEN_KEY);
  // Existing Logout links pass their click event. Keep their UI unchanged.
  // Calls without an event only clear credentials (also used by admin login).
  if (event?.preventDefault) {
    event.preventDefault();
    window.location.assign('/login');
  }
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
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Cannot reach the backend. Check that it is running on port 5000.', { cause: error });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    const message = response.status >= 500
      ? 'The server could not complete your request. Please try again later.'
      : data.message || 'Authentication request failed. Please try again.';
    const error = new Error(message);
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
  if (typeof data.token !== 'string' || !data.token.trim() || !data.user ||
      !['candidate', 'recruiter', 'admin'].includes(data.user.role)) {
    throw new Error('The server returned an incomplete login response. Please try again.');
  }
  sessionStorage.setItem(TOKEN_KEY, data.token);
  return data.user;
}

export async function currentUser(signal) {
  const token = getToken();
  if (!token) {
    const error = new Error("Please log in to continue.");
    error.status = 401;
    throw error;
  }
  try {
    const data = await request('/auth/me', {
      headers: { Authorization: 'Bearer ' + token }, signal,
    });
    if (!data.user || !['candidate', 'recruiter', 'admin'].includes(data.user.role)) {
      throw new Error('Unable to verify your session. Please try again.');
    }
    return data;
  } catch (error) {
    if (error.status === 401 && getToken() === token) logout();
    throw error;
  }
}
