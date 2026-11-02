import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Resume from '../models/Resume.js';
import ActivityLog from '../models/ActivityLog.js';

dotenv.config({ path: new URL('../.env', import.meta.url), quiet: true });
export const base = process.env.API_TEST_URL || 'http://localhost:5000/api';
export const password = 'IntegrationTest!23456';
export const jobBody = { title: 'Temporary integration job', company: 'Test Company', location: 'Colombo', jobType: 'Full-time', experienceLevel: 'Entry Level', description: 'Temporary test record', requirements: ['Testing'], deadline: '2030-12-31' };
export let checks = 0;
export function check(value, expected, message) { assert.deepEqual(value, expected, message); checks++; }
export async function rejects(promise, predicate) { await assert.rejects(promise, predicate); checks++; }
export async function call(path, { method = 'GET', body, token, raw, headers = {} } = {}) {
  const response = await fetch(base + path, { method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
    ...(raw !== undefined ? { body: raw } : body !== undefined ? { body: JSON.stringify(body) } : {}) });
  const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : Buffer.from(await response.arrayBuffer());
  return { status: response.status, data, headers: response.headers };
}
export async function fixture(label) {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  const prefix = `${label}-${randomUUID()}`, emails = [], users = [];
  async function add(role = 'candidate') {
    const email = `${prefix}-${emails.length}@example.com`; emails.push(email);
    const registered = await call('/auth/register', { method: 'POST', body: { firstName: prefix, lastName: 'Test', email, password, confirmPassword: password, role: role === 'admin' ? 'candidate' : role } });
    check(registered.status, 201);
    if (role === 'admin') await User.updateOne({ _id: registered.data.user.id }, { $set: { role: 'admin' } });
    const login = await call('/auth/login', { method: 'POST', body: { email, password } }); check(login.status, 200);
    const user = { id: registered.data.user.id, email, token: login.data.token, role }; users.push(user); return user;
  }
  async function cleanup() {
    if (mongoose.connection.readyState === 1) {
      const ids = (await User.find({ $or: [{ email: { $in: emails } }, { _id: { $in: users.map(user => user.id) } }] }).select('_id')).map(user => user._id);
      await ActivityLog.deleteMany({ actor: { $in: ids } });
      await Resume.deleteMany({ owner: { $in: ids } });
      await Application.deleteMany({ candidate: { $in: ids } });
      await Job.deleteMany({ recruiter: { $in: ids } });
      await User.deleteMany({ _id: { $in: ids } });
    }
    await mongoose.disconnect();
  }
  return { add, cleanup, prefix };
}
export async function browserService(name, token) {
  const dataUrl = source => 'data:text/javascript;base64,' + Buffer.from(source).toString('base64');
  const read = async file => (await readFile(new URL('../../frontend/src/services/' + file + '.js', import.meta.url), 'utf8')).replace('import.meta.env.VITE_API_URL', JSON.stringify(base));
  const authUrl = dataUrl(await read('authService'));
  const apiUrl = dataUrl((await read('apiClient')).replace("'./authService'", JSON.stringify(authUrl)));
  const source = (await read(name)).replace("'./apiClient'", JSON.stringify(apiUrl));
  const storage = new Map([['jobrecruit.token', token]]);
  globalThis.sessionStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  globalThis.window = { location: { assign() {} } };
  return import(dataUrl(source));
}
