import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import ActivityLog from '../models/ActivityLog.js';
import { call, check, checks, fixture, jobBody, browserService, rejects } from './test-support.js';
const test = await fixture('admin-test');
try {
  const candidate = await test.add(), recruiter = await test.add('recruiter'), admin = await test.add('admin');
  const job = await call('/jobs', { method: 'POST', token: recruiter.token, body: { ...jobBody, title: test.prefix } }); check(job.status, 201);
  const jobId = job.data.job.id;
  const applied = await call('/applications', { method: 'POST', token: candidate.token, body: { jobId } }); check(applied.status, 201);
  const id = applied.data.application.id;
  const paths = ['/dashboard', '/users', '/users/' + candidate.id, '/jobs', '/jobs/' + jobId, '/applications', '/applications/' + id, '/activity-logs'];
  for (const path of paths) {
    check((await call('/admin' + path)).status, 401);
    for (const token of [candidate.token, recruiter.token]) check((await call('/admin' + path, { token })).status, 403);
    check((await call('/admin' + path, { token: admin.token })).status, 200);
  }
  const dashboard = (await call('/admin/dashboard', { token: admin.token })).data.dashboard;
  check(dashboard.totalUsers, await User.countDocuments()); check(dashboard.candidates, await User.countDocuments({ role: 'candidate' }));
  check(dashboard.recruiters, await User.countDocuments({ role: 'recruiter' })); check(dashboard.admins, await User.countDocuments({ role: 'admin' }));
  check(dashboard.totalJobs, await Job.countDocuments()); check(dashboard.totalApplications, await Application.countDocuments());
  check(dashboard.jobStatuses.active, await Job.countDocuments({ status: 'active' }));
  check(dashboard.applicationStatuses.pending, await Application.countDocuments({ status: 'pending' }));
  const users = await call('/admin/users?search=' + test.prefix + '&role=candidate&status=active', { token: admin.token });
  check(users.data.users.map(user => user.id), [candidate.id]);
  for (const forbidden of ['password', 'tokenVersion', 'profile', 'preferences']) check(Object.hasOwn(users.data.users[0], forbidden), false);
  check((await call('/admin/users/' + candidate.id, { token: admin.token })).data.user.email, candidate.email);
  await User.updateOne({ _id: candidate.id }, { $set: { status: 'inactive' } });
  check((await call('/admin/users?search=' + test.prefix + '&status=inactive', { token: admin.token })).data.users.map(user => user.id), [candidate.id]);
  check((await call('/auth/me', { token: candidate.token })).status, 401);
  await User.updateOne({ _id: candidate.id }, { $unset: { status: 1 } });
  check((await call('/auth/me', { token: candidate.token })).status, 200, 'Legacy user remains active');
  check((await call('/admin/users?search=' + test.prefix + '&status=active', { token: admin.token })).data.total, 3);
  const jobs = await call('/admin/jobs?search=' + test.prefix + '&status=active&jobType=Full-time', { token: admin.token }); check(jobs.data.jobs[0].id, jobId);
  await call('/jobs/' + jobId + '/status', { method: 'PATCH', token: recruiter.token, body: { status: 'closed' } });
  check((await call('/admin/jobs?search=' + test.prefix + '&status=closed', { token: admin.token })).data.jobs[0].id, jobId);
  const applications = await call('/admin/applications?search=' + candidate.email + '&status=pending', { token: admin.token }); check(applications.data.applications[0].id, id);
  check((await call('/admin/applications/' + id, { token: admin.token })).data.application.candidateName.includes(test.prefix), true);
  for (const path of ['/users?role=superuser', '/users?status=deleted', '/users?search[$ne]=x', '/users?search=a&search=b', '/users?limit=101', '/users?page=0', '/users?page=1.5', '/users?limit=-1', '/users?extra=x', '/jobs?status=pending', '/jobs?jobType=invalid', '/applications?status=hired', '/activity-logs?actor=bad', '/activity-logs?days=365', '/activity-logs?category=Invalid']) {
    check((await call('/admin' + path, { token: admin.token })).status, 400, path);
  }
  check((await call('/admin/users?search=' + encodeURIComponent('.*'), { token: admin.token })).data.total, 0, 'Search metacharacters are literal');
  const first = (await call('/admin/users?search=' + test.prefix + '&limit=1&page=1', { token: admin.token })).data;
  const second = (await call('/admin/users?search=' + test.prefix + '&limit=1&page=2', { token: admin.token })).data;
  check(first.total, 3); check(first.users.length, 1); check(first.users[0].id === second.users[0].id, false);
  for (const collection of ['users', 'jobs', 'applications']) {
    check((await call('/admin/' + collection + '/bad', { token: admin.token })).status, 400);
    check((await call('/admin/' + collection + '/' + new mongoose.Types.ObjectId(), { token: admin.token })).status, 404);
  }
  const activities = (await call('/admin/activity-logs?actor=' + candidate.id + '&category=Application&days=7', { token: admin.token })).data.activities;
  check(activities.some(item => item.action === 'Application submitted' && item.targetId === id), true);
  const logs = (await call('/admin/activity-logs?search=' + test.prefix, { token: admin.token })).data.activities;
  check(logs.length >= 5, true);
  check(logs.every((item, i) => !i || new Date(logs[i - 1].timestamp) >= new Date(item.timestamp)), true);
  check(JSON.stringify(logs).includes('IntegrationTest!'), false); check(JSON.stringify(logs).includes(candidate.token), false);
  for (const method of ['PATCH', 'DELETE', 'POST']) {
    check((await call('/admin/activity-logs', { method, token: candidate.token, body: {} })).status, 403);
    check((await call('/admin/activity-logs', { method, token: admin.token, body: {} })).status, 404);
  }
  const forged = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { subject: candidate.id, issuer: 'jobrecruit-api', audience: 'jobrecruit-frontend' });
  check((await call('/admin/users', { token: forged })).status, 403, 'Current DB role overrides token role');
  await User.updateOne({ _id: admin.id }, { $set: { role: 'candidate' } });
  check((await call('/admin/users', { token: admin.token })).status, 403, 'Revoked database role is immediate');
  await User.updateOne({ _id: admin.id }, { $set: { role: 'admin' } });
  const expired = jwt.sign({}, process.env.JWT_SECRET, { subject: admin.id, expiresIn: -1, issuer: 'jobrecruit-api', audience: 'jobrecruit-frontend' });
  for (const token of [expired, 'broken.token', admin.token + 'x']) check((await call('/admin/users', { token })).status, 401);
  const service = await browserService('adminService', admin.token);
  check((await service.getAdminDashboard()).totalUsers, await User.countDocuments());
  check((await service.getAdminRecords('users')).some(user => user.id === candidate.id), true);
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw new TypeError('Offline'); };
    await rejects(service.getAdminDashboard(), /Cannot reach the backend/);
    globalThis.fetch = async () => new Response(JSON.stringify({ success: false }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    await rejects(service.getAdminDashboard(), /Please try again later/);
  } finally { globalThis.fetch = originalFetch; }
  await mongoose.disconnect(); await mongoose.connect(process.env.MONGODB_URI);
  check(await ActivityLog.countDocuments({ actor: candidate.id }) > 0, true, 'Audit records persist across reconnect');
  console.log(`PASS: ${checks} admin checks (roles, filters, pagination, audit records, persistence, and frontend service).`);
} finally { await test.cleanup(); }
