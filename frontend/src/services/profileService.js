import { apiRequest } from './apiClient';
import { getToken, setToken } from './authService';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const NETWORK_ERROR_MESSAGE = 'Cannot reach the backend. Check that it is running on port 5000.';
const SERVER_ERROR_MESSAGE = 'The server could not complete your request. Please try again later.';

async function readErrorData(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json') || contentType.includes('+json')) {
    return response.json().catch(() => null);
  }
  return response.text().catch(() => '');
}

function makeRequestError(data, status) {
  const message = status >= 500
    ? SERVER_ERROR_MESSAGE
    : data && typeof data === 'object' && typeof data.message === 'string' && data.message
      ? data.message
      : typeof data === 'string' && data.trim()
        ? data
        : 'The request could not be completed. Please try again.';
  const error = new Error(message);
  error.status = status;
  error.data = data;
  return error;
}

async function requestResume(path, { method, body, filename, signal, expectBlob = false }) {
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);

  if (method === 'PUT') {
    headers.set('Content-Type', 'application/pdf');
    if (filename) headers.set('X-Filename', filename);
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      ...(body !== undefined ? { body } : {}),
      signal,
    });
  } catch (cause) {
    if (cause.name === 'AbortError') throw cause;
    throw new Error(NETWORK_ERROR_MESSAGE, { cause });
  }

  if (!response.ok) {
    const data = await readErrorData(response);
    throw makeRequestError(data, response.status);
  }

  if (expectBlob) return response.blob();

  const data = await response.json().catch(() => null);
  if (data && data.success === false) throw makeRequestError(data, response.status);
  return data;
}

export async function getProfile(signal) {
  return apiRequest('/profile', { signal });
}

export async function updateProfile(fields, signal) {
  const data = await apiRequest('/profile', { method: 'PATCH', body: fields, signal });
  return data.profile;
}

export async function getSettings(signal) {
  const data = await apiRequest('/profile/settings', { signal });
  return data.settings;
}

export async function updateSettings(settings, signal) {
  const data = await apiRequest('/profile/settings', { method: 'PATCH', body: settings, signal });
  return data.settings;
}

export async function updateAccount(changes, signal) {
  const data = await apiRequest('/profile/account', { method: 'PATCH', body: changes, signal });
  setToken(data.token);
  return data.profile;
}

export async function uploadResume(file, signal) {
  const filename = file?.name || 'resume.pdf';
  const data = await requestResume('/profile/resume', {
    method: 'PUT', body: file, filename, signal,
  });
  return data.resume;
}

export function downloadResume(candidateId, signal) {
  return requestResume(`/profile/resume/${encodeURIComponent(candidateId)}`, {
    method: 'GET', signal, expectBlob: true,
  });
}
