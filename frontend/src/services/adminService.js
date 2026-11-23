import { apiRequest } from './apiClient';

function queryString(filters = {}) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function getAdminDashboard(filters = {}, signal) {
  return apiRequest(`/admin/dashboard${queryString(filters)}`, { signal }).then((data) => data.dashboard);
}

const recordRequests = {
  users: [getAdminUsers, 'users'],
  jobs: [getAdminJobs, 'jobs'],
  applications: [getAdminApplications, 'applications'],
  'activity-logs': [getAdminActivityLogs, 'activities'],
};

export async function getAdminRecords(collection, filters = {}, signal) {
  const recordRequest = recordRequests[collection];
  if (!recordRequest) throw new Error(`Unsupported admin collection: ${collection}`);

  const [request, key] = recordRequest;
  const data = await request(filters, signal);
  return data[key];
}

export function getAdminUsers(filters = {}, signal) {
  return apiRequest(`/admin/users${queryString(filters)}`, { signal });
}

export function getAdminUserById(id, signal) {
  return apiRequest(`/admin/users/${encodeURIComponent(id)}`, { signal });
}

export function getAdminJobs(filters = {}, signal) {
  return apiRequest(`/admin/jobs${queryString(filters)}`, { signal });
}

export function getAdminJobById(id, signal) {
  return apiRequest(`/admin/jobs/${encodeURIComponent(id)}`, { signal });
}

export function getAdminApplications(filters = {}, signal) {
  return apiRequest(`/admin/applications${queryString(filters)}`, { signal });
}

export function getAdminApplicationById(id, signal) {
  return apiRequest(`/admin/applications/${encodeURIComponent(id)}`, { signal });
}

export function getAdminActivityLogs(filters = {}, signal) {
  return apiRequest(`/admin/activity-logs${queryString(filters)}`, { signal });
}
