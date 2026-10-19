import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authorize } from '../middleware/auth.js';

dotenv.config({ path: new URL('../.env', import.meta.url), quiet: true });
const base = process.env.AUTH_TEST_URL || 'http://localhost:5000/api';
const suffix = randomUUID();
const emails = ['candidate', 'recruiter', 'race'].map(role => `auth-test-${role}-${suffix}@example.com`);
const password = 'AuthTest!23456';
let checks = 0;

async function call(path, body, token) {
  const response = await fetch(base + path, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  return { status: response.status, data: await response.json() };
}
function check(result, status) { assert.equal(result.status, status, JSON.stringify(result.data)); checks++; }
const details = {
  firstName: 'Auth', lastName: 'Test', email: emails[0], password, confirmPassword: password, role: 'candidate',
};

try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  check(await call('/test'), 200);
  check(await call('/auth/register', details), 201);
  const saved = await User.findOne({ email: emails[0] }).select('+password');
  assert(saved && saved.password !== password && await bcrypt.compare(password, saved.password)); checks++;
  check(await call('/auth/register', { ...details, email: '  ' + emails[0].toUpperCase() + '  ' }), 409);
  check(await call('/auth/register', { ...details, role: 'admin' }), 400);
  check(await call('/auth/register', { ...details, role: 'Admin' }), 400);
  for (const field of Object.keys(details)) {
    const missing = { ...details }; delete missing[field];
    check(await call('/auth/register', missing), 400);
  }
  check(await call('/auth/register', { ...details, firstName: '  ' }), 400);
  check(await call('/auth/register', { ...details, email: 'invalid' }), 400);
  check(await call('/auth/register', { ...details, confirmPassword: 'different' }), 400);
  check(await call('/auth/register', { ...details, password: 'short', confirmPassword: 'short' }), 400);
  check(await call('/auth/register', { ...details, password: 'x'.repeat(73), confirmPassword: 'x'.repeat(73) }), 400);
  check(await call('/auth/login', { email: emails[0], password: 'incorrect' }), 401);
  check(await call('/auth/login', { email: 'missing-' + suffix + '@example.com', password }), 401);
  check(await call('/auth/login', { email: emails[0] }), 400);
  check(await call('/auth/login', { email: { $ne: null }, password }), 400);
  const login = await call('/auth/login', { email: emails[0].toUpperCase(), password, role: 'admin' });
  check(login, 200);
  assert.equal(login.data.user.role, 'candidate');
  assert.equal(login.data.user.password, undefined);
  assert.equal(jwt.verify(login.data.token, process.env.JWT_SECRET, { algorithms: ['HS256'] }).sub, saved.id); checks++;
  check(await call('/auth/me'), 401);
  check(await call('/auth/me', undefined, 'not-a-token'), 401);
  const me = await call('/auth/me', undefined, login.data.token);
  check(me, 200); assert.equal(me.data.user.password, undefined);
  const expired = jwt.sign({}, process.env.JWT_SECRET, {
    subject: saved.id, expiresIn: -1, issuer: 'jobrecruit-api', audience: 'jobrecruit-frontend',
  });
  check(await call('/auth/me', undefined, expired), 401);
  const tampered = jwt.sign({}, 'different-private-test-secret-123456789', {
    subject: saved.id, expiresIn: '1h', issuer: 'jobrecruit-api', audience: 'jobrecruit-frontend',
  });
  check(await call('/auth/me', undefined, tampered), 401);
  await User.updateOne({ _id: saved._id }, { $set: { role: 'recruiter' } });
  assert.equal((await call('/auth/me', undefined, login.data.token)).data.user.role, 'recruiter'); checks++;
  await User.deleteOne({ _id: saved._id });
  check(await call('/auth/me', undefined, login.data.token), 401);
  check(await call('/auth/register', { ...details, email: emails[1], role: 'recruiter' }), 201);
  const recruiter = await call('/auth/login', { email: emails[1], password, role: 'candidate' });
  check(recruiter, 200); assert.equal(recruiter.data.user.role, 'recruiter');
  const racing = await Promise.all([1, 2].map(() => call('/auth/register', { ...details, email: emails[2] })));
  assert.deepEqual(racing.map(r => r.status).sort(), [201, 409]); checks++;
  let status;
  const res = { status(value) { status = value; return this; }, json() {} };
  authorize('admin')({ user: { role: 'candidate' } }, res, () => assert.fail('Unauthorized access'));
  assert.equal(status, 403); checks++;
  let allowed = false;
  authorize('recruiter')({ user: { role: 'recruiter' } }, res, () => { allowed = true; });
  assert(allowed); checks++;
  const malformed = await fetch(base + '/auth/register', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{broken',
  });
  assert.equal(malformed.status, 400); checks++;
  const cors = await fetch(base + '/auth/login', {
    method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'POST' },
  });
  assert.equal(cors.headers.get('access-control-allow-origin'), 'http://localhost:5173'); checks++;
  console.log(`PASS: ${checks} authentication checks, including MongoDB persistence, bcrypt, JWT, database roles and concurrent duplicates.`);
} finally {
  // Only remove the randomly named accounts created by this test run.
  if (mongoose.connection.readyState === 1) await User.deleteMany({ email: { $in: emails } });
  await mongoose.disconnect();
}
