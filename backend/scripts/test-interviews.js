import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Interview, { InterviewRound } from '../models/Interview.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

dotenv.config({ path: new URL('../.env', import.meta.url), quiet: true });
const base = process.env.INTERVIEW_TEST_URL || 'http://localhost:5000/api';
const suffix = randomUUID();
const emails = ['candidate-a', 'candidate-b', 'recruiter-a', 'recruiter-b'].map(role => 'interview-test-' + role + '-' + suffix + '@example.com');
const userIds = [];
const applicationIds = [];
const password = 'InterviewTest!23456';
let checks = 0;
function check(actual, expected, message) { assert.deepEqual(actual, expected, message); checks++; }
async function rejects(promise, predicate) { await assert.rejects(promise, predicate); checks++; }
async function call(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(base + path, {
    method, headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  await Interview.init();
  check(Interview.schema.indexes().some(([, options]) => options.unique), false, 'Multiple rounds allowed');
  const tokens = [];
  for (let i = 0; i < emails.length; i++) {
    const registered = await call('/auth/register', { method: 'POST', body: { firstName: 'Interview', lastName: 'Test', email: emails[i], password, confirmPassword: password, role: i < 2 ? 'candidate' : 'recruiter' } });
    check(registered.status, 201); userIds.push(registered.data.user.id);
    const login = await call('/auth/login', { method: 'POST', body: { email: emails[i], password } });
    check(login.status, 200); tokens.push(login.data.token);
  }
  const [candidate, otherCandidate, recruiter, otherRecruiter] = tokens;
  const jobBody = { title: 'Interview Test ' + suffix, company: 'Test Company', location: 'Colombo', jobType: 'Full-time', experienceLevel: 'Entry Level', description: 'Temporary integration test job', requirements: ['Testing'], deadline: '2030-12-31' };
  const job = await call('/jobs', { method: 'POST', token: recruiter, body: jobBody });
  check(job.status, 201);
  const jobId = job.data.job.id;
  const applied = await call('/applications', { method: 'POST', token: candidate, body: { jobId } });
  check(applied.status, 201);
  const applicationId = applied.data.application.id; applicationIds.push(applicationId);
  const body = { applicationId, interviewDate: '2027-06-15', interviewTime: '10:30', interviewType: 'Video Call', meetingLink: 'https://example.com/interview', notes: 'Integration test' };
  check((await call('/interviews', { method: 'POST', token: recruiter, body })).status, 409, 'Pending application rejected');
  check((await call('/applications/' + applicationId + '/status', { method: 'PATCH', token: recruiter, body: { status: 'shortlisted' } })).status, 200);
  for (const path of ['/interviews/my', '/interviews/recruiter', '/interviews/' + new mongoose.Types.ObjectId()]) check((await call(path)).status, 401);
  for (const [path, method] of [['/interviews', 'POST'], ['/interviews/' + new mongoose.Types.ObjectId() + '/status', 'PATCH']]) check((await call(path, { method, body })).status, 401);
  check((await call('/interviews/my', { token: 'invalid' })).status, 401);
  check((await call('/interviews', { method: 'POST', token: candidate, body })).status, 403);
  check((await call('/interviews', { method: 'POST', token: otherRecruiter, body })).status, 403);
  check((await call('/interviews/my', { token: recruiter })).status, 403);
  check((await call('/interviews/recruiter', { token: candidate })).status, 403);
  for (const bad of [{ applicationId: 'bad' }, { applicationId: { $ne: null } }, { interviewDate: '' }, { interviewDate: '2027-02-30' }, { interviewTime: '24:10' }, { interviewTime: {} }, { interviewType: 'invalid' }, { meetingLink: '' }, { meetingLink: 'javascript:alert(1)' }, { notes: {} }, { notes: 'x'.repeat(10001) }, { jobId: String(new mongoose.Types.ObjectId()) }]) {
    check((await call('/interviews', { method: 'POST', token: recruiter, body: { ...body, ...bad } })).status, 400, JSON.stringify(bad).slice(0, 100));
  }
  check((await call('/interviews', { method: 'POST', token: recruiter, body: {} })).status, 400);
  check((await call('/interviews', { method: 'POST', token: recruiter, body: { ...body, applicationId: String(new mongoose.Types.ObjectId()) } })).status, 404);
  const first = await call('/interviews', { method: 'POST', token: recruiter, body: { ...body, candidateId: userIds[1], recruiterId: userIds[3], status: 'completed', round: 99 } });
  check(first.status, 201);
  const id = first.data.interview.id;
  check(first.data.interview.round, 1); check(first.data.interview.status, 'scheduled');
  check(first.data.interview.candidateId, userIds[0]); check(first.data.interview.recruiterId, userIds[2]);
  check(first.data.interview.jobId, jobId); check(first.data.interview.candidateEmail, emails[0]);
  check(String((await Interview.findById(id)).applicationId), applicationId);
  check((await call('/interviews/my', { token: candidate })).data.interviews.map(item => item.id), [id]);
  check((await call('/interviews/my?candidateId=' + userIds[0], { token: otherCandidate })).data.interviews, []);
  check((await call('/interviews/recruiter', { token: recruiter })).data.interviews.map(item => item.id), [id]);
  check((await call('/interviews/recruiter?recruiterId=' + userIds[2], { token: otherRecruiter })).data.interviews, []);
  for (const token of [candidate, recruiter]) check((await call('/interviews/' + id, { token })).status, 200);
  for (const token of [otherCandidate, otherRecruiter]) check((await call('/interviews/' + id, { token })).status, 403);
  for (const token of [candidate, otherCandidate, otherRecruiter]) {
    check((await call('/interviews/' + id + '/status', { method: 'PATCH', token, body: { status: 'completed' } })).status, 403);
    check((await call('/interviews/' + id, { method: 'PATCH', token, body: { notes: 'unauthorized' } })).status, 403);
  }
  for (const status of ['', 'invalid', null, { $ne: null }]) check((await call('/interviews/' + id + '/status', { method: 'PATCH', token: recruiter, body: { status } })).status, 400);
  const concurrent = await Promise.all([1, 2, 3].map(() => call('/interviews', { method: 'POST', token: recruiter, body: { ...body, interviewType: 'Phone Call', meetingLink: '' } })));
  check(concurrent.map(item => item.status), [201, 201, 201]);
  check(concurrent.map(item => item.data.interview.round).sort(), [2, 3, 4]);
  check(await Interview.countDocuments({ applicationId }), 4);
  for (const status of ['completed', 'cancelled', 'scheduled']) {
    check((await call('/interviews/' + id + '/status', { method: 'PATCH', token: recruiter, body: { status } })).data.interview.status, status);
    check((await Interview.findById(id)).status, status);
    check((await call('/interviews/' + id, { token: candidate })).data.interview.status, status);
  }
  check((await call('/interviews/' + id + '/status', { method: 'PATCH', token: recruiter, body: { status: 'completed' } })).status, 200);
  await mongoose.disconnect();
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  check((await Interview.findById(id)).status, 'completed', 'Status survives database reconnect');
  check((await call('/interviews/' + id, { token: recruiter })).data.interview.status, 'completed');
  for (const missing of ['bad', String(new mongoose.Types.ObjectId())]) {
    check((await call('/interviews/' + missing, { token: recruiter })).status, 404);
    check((await call('/interviews/' + missing + '/status', { method: 'PATCH', token: recruiter, body: { status: 'completed' } })).status, 404);
  }
  check((await call('/interviews/' + id, { method: 'PATCH', token: recruiter, body: { meetingLink: '' } })).status, 400);
  const edited = await call('/interviews/' + id, { method: 'PATCH', token: recruiter, body: { notes: 'Updated', interviewType: 'In-person', meetingLink: '', candidateId: userIds[1], round: 90 } });
  check(edited.status, 200); check(edited.data.interview.candidateId, userIds[0]); check(edited.data.interview.round, 1);
  check((await Interview.findById(id)).notes, 'Updated');
  // Exercise actual frontend service, including status mapping and error handling.
  const authSource = (await readFile(new URL('../../frontend/src/services/authService.js', import.meta.url), 'utf8')).replace('import.meta.env.VITE_API_URL', JSON.stringify(base));
  const authUrl = 'data:text/javascript;base64,' + Buffer.from(authSource).toString('base64');
  const source = (await readFile(new URL('../../frontend/src/services/interviewService.js', import.meta.url), 'utf8')).replace("'./authService'", JSON.stringify(authUrl)).replace('import.meta.env.VITE_API_URL', JSON.stringify(base));
  const storage = new Map();
  globalThis.sessionStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  const redirects = [];
  globalThis.window = { location: { assign: path => redirects.push(path) } };
  const service = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  storage.set('jobrecruit.token', candidate);
  check((await service.getMyInterviews()).find(item => item.id === id).status, 'Completed');
  await rejects(service.updateInterviewStatus(id, 'cancelled'), error => error.status === 403);
  await rejects(service.getInterviewById(String(new mongoose.Types.ObjectId())), error => error.status === 404);
  storage.set('jobrecruit.token', recruiter);
  check((await service.getInterviewsByApplicationId(applicationId)).length, 4);
  check((await service.getInterviews()).length, 4);
  const created = await service.createInterview(body); check(created.round, 5);
  check((await service.updateInterview(created.id, { status: 'cancelled' })).status, 'cancelled');
  check((await service.updateInterview(created.id, { notes: 'Service update' })).notes, 'Service update');
  check((await service.getInterviewById(created.id)).notes, 'Service update');
  await rejects(service.createInterview({ ...body, interviewTime: '' }), error => error.status === 400);
  await call('/applications/' + applicationId + '/status', { method: 'PATCH', token: recruiter, body: { status: 'rejected' } });
  await rejects(service.createInterview(body), error => error.status === 409);
  const realFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw new TypeError('Offline'); };
    await rejects(service.getInterviews(), /Cannot reach the backend/);
    globalThis.fetch = async () => ({ ok: false, status: 500, json: async () => ({}) });
    await rejects(service.getInterviews(), /Please try again later/);
  } finally { globalThis.fetch = realFetch; }
  storage.set('jobrecruit.token', 'invalid');
  await rejects(service.getInterviews(), error => error.status === 401);
  check(storage.get('jobrecruit.token'), undefined); check(redirects.at(-1), '/login');
  await rejects(service.getInterviews(), error => error.status === 401);
  // Deleted job must not crash candidate history or grant recruiter management access.
  await Job.deleteOne({ _id: jobId });
  check((await call('/interviews/' + id, { token: candidate })).data.interview.jobTitle, 'Job no longer available');
  check((await call('/interviews/' + id, { token: recruiter })).status, 403);
  check((await call('/interviews/' + id + '/status', { method: 'PATCH', token: recruiter, body: { status: 'cancelled' } })).status, 403);
  console.log('PASS: ' + checks + ' interview checks (MongoDB, roles, ownership, validation, concurrent rounds, persistence, frontend services, and errors).');
} finally {
  if (mongoose.connection.readyState === 1) {
    await Interview.deleteMany({ candidateId: { $in: userIds } });
    await InterviewRound.deleteMany({ _id: { $in: applicationIds } });
    await Application.deleteMany({ candidate: { $in: userIds } });
    await Job.deleteMany({ recruiter: { $in: userIds } });
    await User.deleteMany({ email: { $in: emails } });
  }
  await mongoose.disconnect();
}
