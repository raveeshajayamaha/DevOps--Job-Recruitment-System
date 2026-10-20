import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Job from '../models/Job.js';

dotenv.config({ path: new URL('../.env', import.meta.url), quiet: true });
const base = process.env.APPLICATION_TEST_URL || 'http://localhost:5000/api';
const suffix = randomUUID();
const emails = ['candidate-a', 'candidate-b', 'recruiter-a', 'recruiter-b'].map(role => `application-test-${role}-${suffix}@example.com`);
const userIds = [];
let checks = 0;
function check(value, expected, message) { assert.deepEqual(value, expected, message); checks++; }
async function call(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(base + path, {
    method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  await Application.init();
  check(Application.schema.indexes().some(([fields, options]) => fields.candidate === 1 && fields.job === 1 && options.unique), true);
  const tokens = [];
  for (let i = 0; i < emails.length; i++) {
    const password = 'ApplicationTest!23456';
    const registered = await call('/auth/register', { method: 'POST', body: { firstName: 'Application', lastName: 'Test', email: emails[i], password, confirmPassword: password, role: i < 2 ? 'candidate' : 'recruiter' } });
    check(registered.status, 201); userIds.push(registered.data.user.id);
    const login = await call('/auth/login', { method: 'POST', body: { email: emails[i], password } });
    check(login.status, 200); tokens.push(login.data.token);
  }
  const [candidate, otherCandidate, recruiter, otherRecruiter] = tokens;
  const jobBody = { title: 'Application Test ' + suffix, company: 'Test Company', location: 'Colombo', jobType: 'Full-time', experienceLevel: 'Entry Level', description: 'Temporary integration test job', requirements: ['Testing'], deadline: '2030-12-31' };
  const createdJob = await call('/jobs', { method: 'POST', token: recruiter, body: jobBody });
  check(createdJob.status, 201);
  const jobId = createdJob.data.job.id;
  for (const path of ['/applications/my', '/applications/recruiter', '/applications/' + new mongoose.Types.ObjectId()]) check((await call(path)).status, 401);
  check((await call('/applications', { method: 'POST', body: { jobId } })).status, 401);
  check((await call('/applications', { method: 'POST', token: recruiter, body: { jobId } })).status, 403);
  check((await call('/applications/my', { token: recruiter })).status, 403);
  check((await call('/applications/recruiter', { token: candidate })).status, 403);
  for (const body of [{}, { jobId: 'bad' }, { jobId: { $ne: null } }, { jobId: ['bad'] }]) check((await call('/applications', { method: 'POST', token: candidate, body })).status, 400);
  check((await call('/applications', { method: 'POST', token: candidate, body: { jobId: String(new mongoose.Types.ObjectId()) } })).status, 404);
  const attempts = await Promise.all([1, 2].map(() => call('/applications', { method: 'POST', token: candidate, body: { jobId, candidateId: userIds[1], recruiterId: userIds[3], status: 'shortlisted' } })));
  check(attempts.map(result => result.status).sort(), [201, 409]);
  const application = attempts.find(result => result.status === 201).data.application;
  const id = application.id;
  check(application.candidateId, userIds[0]); check(application.status, 'pending');
  check(application.email, emails[0]); check(application.jobTitle, jobBody.title);
  check(application.skills, []); check(application.resume, ''); check(application.experience, '');
  check(Object.hasOwn(application, 'password'), false);
  check(await Application.countDocuments({ candidate: userIds[0], job: jobId }), 1);
  check((await call('/applications', { method: 'POST', token: candidate, body: { jobId } })).data.message, 'You have already applied for this job.');
  check((await call('/applications/my', { token: candidate })).data.applications.map(item => item.id), [id]);
  check((await call('/applications/my?candidateId=' + userIds[0], { token: otherCandidate })).data.applications, []);
  check((await call('/applications/recruiter', { token: recruiter })).data.applications.map(item => item.id), [id]);
  check((await call('/applications/recruiter?recruiterId=' + userIds[2], { token: otherRecruiter })).data.applications, []);
  for (const token of [candidate, recruiter]) check((await call('/applications/' + id, { token })).status, 200);
  for (const token of [otherCandidate, otherRecruiter]) check((await call('/applications/' + id, { token })).status, 403);
  for (const token of [candidate, otherCandidate, otherRecruiter]) check((await call('/applications/' + id + '/status', { method: 'PATCH', token, body: { status: 'rejected' } })).status, 403);
  for (const status of ['invalid', 'Shortlisted', '', null, { $ne: null }]) check((await call('/applications/' + id + '/status', { method: 'PATCH', token: recruiter, body: { status } })).status, 400);
  for (const status of ['shortlisted', 'interview', 'rejected', 'pending']) {
    const before = (await Application.findById(id)).lastUpdated;
    const updated = await call('/applications/' + id + '/status', { method: 'PATCH', token: recruiter, body: { status } });
    check(updated.status, 200); check(updated.data.application.status, status);
    check((await Application.findById(id)).status, status);
    check((await Application.findById(id)).lastUpdated >= before, true);
    check((await call('/applications/' + id, { token: candidate })).data.application.status, status);
  }
  for (const invalidId of ['not-an-id', String(new mongoose.Types.ObjectId())]) {
    check((await call('/applications/' + invalidId, { token: candidate })).status, 404);
    check((await call('/applications/' + invalidId + '/status', { method: 'PATCH', token: recruiter, body: { status: 'pending' } })).status, 404);
  }
  await call('/jobs/' + jobId + '/status', { method: 'PATCH', token: recruiter, body: { status: 'closed' } });
  check((await call('/applications', { method: 'POST', token: otherCandidate, body: { jobId } })).status, 400);
  check((await call('/applications/' + id, { token: candidate })).data.application.jobTitle, jobBody.title);
  await mongoose.disconnect();
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  check((await Application.findById(id)).status, 'pending', 'Application persists across database reconnect');
  // Load the real browser services with a small sessionStorage adapter.
  const authSource = (await readFile(new URL('../../frontend/src/services/authService.js', import.meta.url), 'utf8')).replace('import.meta.env.VITE_API_URL', JSON.stringify(base));
  const authUrl = 'data:text/javascript;base64,' + Buffer.from(authSource).toString('base64');
  const serviceSource = (await readFile(new URL('../../frontend/src/services/applicationService.js', import.meta.url), 'utf8')).replace("'./authService'", JSON.stringify(authUrl)).replace('import.meta.env.VITE_API_URL', JSON.stringify(base));
  const storage = new Map();
  globalThis.sessionStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  const redirects = [];
  globalThis.window = { location: { assign: path => redirects.push(path) } };
  const auth = await import(authUrl);
  const service = await import('data:text/javascript;base64,' + Buffer.from(serviceSource).toString('base64'));
  await auth.login(emails[0], 'ApplicationTest!23456');
  check((await service.getMyApplications())[0].id, id);
  check((await service.getApplicationById(id)).id, id);
  await assert.rejects(service.updateApplicationStatus(id, 'rejected'), error => error.status === 403); checks++;
  await auth.login(emails[2], 'ApplicationTest!23456');
  check((await service.getRecruiterApplications())[0].id, id);
  check((await service.updateApplicationStatus(id, 'shortlisted')).status, 'shortlisted');
  await call('/jobs/' + jobId + '/status', { method: 'PATCH', token: recruiter, body: { status: 'active' } });
  await auth.login(emails[1], 'ApplicationTest!23456');
  const second = await service.createApplication(jobId);
  check(second.status, 'pending');
  await assert.rejects(service.createApplication(jobId), error => error.status === 409); checks++;
  check((await call('/applications/' + second.id + '/status', { method: 'PATCH', token: recruiter, body: { status: 'rejected' } })).status, 200);
  check((await service.getApplicationById(second.id)).status, 'rejected');
  const realFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw new TypeError('Network unavailable'); };
    await assert.rejects(service.getMyApplications(), /Cannot reach the backend/); checks++;
  } finally { globalThis.fetch = realFetch; }
  storage.set('jobrecruit.token', 'invalid-token');
  await assert.rejects(service.getMyApplications(), error => error.status === 401); checks++;
  check(redirects.at(-1), '/login'); check(auth.getToken(), null);
  // Deleted jobs must not crash candidate history or accidentally grant recruiter access.
  await call('/jobs/' + jobId, { method: 'DELETE', token: recruiter });
  check((await call('/applications/' + id, { token: candidate })).data.application.jobTitle, 'Job no longer available');
  check((await call('/applications/' + id, { token: recruiter })).status, 403);
  console.log(`PASS: ${checks} application checks (MongoDB persistence, duplicate races, roles, ownership, statuses, invalid IDs, frontend service, network failure, and deleted jobs).`);
} finally {
  if (mongoose.connection.readyState === 1) {
    await Application.deleteMany({ candidate: { $in: userIds } });
    await Job.deleteMany({ recruiter: { $in: userIds } });
    await User.deleteMany({ email: { $in: emails } });
  }
  await mongoose.disconnect();
}
