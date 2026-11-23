const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const TOKEN_KEY = 'jobrecruit.token';
const NETWORK_ERROR_MESSAGE = 'Cannot reach the backend. Check that it is running on port 5000.';
const SERVER_ERROR_MESSAGE = 'The server could not complete your request. Please try again later.';

function getStoredToken() {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

async function readResponse(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json') || contentType.includes('+json')) {
    return response.json().catch(() => null);
  }

  return response.text().catch(() => '');
}

function errorMessage(data, status) {
  if (status >= 500) return SERVER_ERROR_MESSAGE;
  if (data && typeof data === 'object' && typeof data.message === 'string' && data.message) {
    return data.message;
  }
  if (typeof data === 'string' && data.trim()) return data;
  return 'The request could not be completed. Please try again.';
}

/**
 * Sends a request to the configured API and returns its parsed response body.
 * Object bodies are JSON encoded; the current session token is attached when present.
 */
export async function apiRequest(path, options = {}) {
  const { body, headers = {}, ...requestOptions } = options;
  const requestHeaders = new Headers(headers);
  const token = getStoredToken();

  if (token && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  let requestBody = body;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  if (body !== undefined && body !== null && typeof body !== 'string' && !isFormData) {
    requestBody = JSON.stringify(body);
    if (!requestHeaders.has('Content-Type')) requestHeaders.set('Content-Type', 'application/json');
  }

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...requestOptions,
      headers: requestHeaders,
      ...(requestBody !== undefined ? { body: requestBody } : {}),
    });
  } catch (cause) {
    if (cause.name === 'AbortError') throw cause;
    throw new Error(NETWORK_ERROR_MESSAGE, { cause });
  }

  const data = await readResponse(response);
  if (!response.ok || (data && typeof data === 'object' && data.success === false)) {
    const error = new Error(errorMessage(data, response.status));
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
