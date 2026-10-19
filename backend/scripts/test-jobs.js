import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import Job from '../models/Job.js';
import User from '../models/User.js';

dotenv.config({ path: new URL('../.env', import.meta.url), quiet: true });
const base = process.env.JOB_TEST_URL || 'http://localhost:5000/api';
const frontend = process.env.JOB_TEST_FRONTEND_URL || 'http://localhost:5173';
const suffix = randomUUID();
const emails = ['recruiter-a', 'recruiter-b', 'candidate'].map(role => `job-test-${role}-${suffix}@example.com`);
const password = 'JobTest!23456';
const userIds = [];
let checks = 0;
let browser;
function check(value, expected, message) { assert.deepEqual(value, expected, message); checks++; }
async function call(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(base + path, {
    method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, data: await response.json() };
}
const details = {
  title: `JobTest C++ [${suffix}]`, company: `JobTest Company ${suffix}`, location: 'Colombo',
  jobType: 'Full-time', salaryMin: 100000, salaryMax: 150000, experienceLevel: 'Mid Level',
  description: 'An integration test job.', requirements: ['React experience'], skills: ['React'], deadline: '2030-12-31',
};
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  const tokens = [];
  for (let index = 0; index < emails.length; index++) {
    const register = await call('/auth/register', { method: 'POST', body: { firstName: 'JobTest', lastName: 'User', email: emails[index], password, confirmPassword: password, role: index === 2 ? 'candidate' : 'recruiter' } });
    check(register.status, 201);
    userIds.push(register.data.user.id);
    const login = await call('/auth/login', { method: 'POST', body: { email: emails[index], password } });
    check(login.status, 200);
    tokens.push(login.data.token);
  }
  const [owner, other, candidate] = tokens;
  check((await call('/jobs')).status, 401);
  check((await call('/jobs', { method: 'POST', body: details })).status, 401);
  for (const token of [candidate]) {
    check((await call('/jobs', { method: 'POST', body: details, token })).status, 403);
    check((await call('/jobs/my', { token })).status, 403);
  }
  for (const body of [{}, { ...details, salaryMin: -1 }, { ...details, salaryMax: 1 }, { ...details, requirements: 'React' }, { ...details, skills: [42] }, { ...details, jobType: 'invalid' }, { ...details, deadline: '2030-02-31' }, { ...details, title: { $ne: null } }, { ...details, salaryMin: 'abc' }, { ...details, status: 'invalid' }]) {
    check((await call('/jobs', { method: 'POST', body, token: owner })).status, 400);
  }
  const created = await call('/jobs', { method: 'POST', body: { ...details, recruiter: userIds[1], applicantsCount: 999, postedDate: '2000-01-01' }, token: owner });
  check(created.status, 201);
  const id = created.data.job.id;
  check(created.data.job.recruiter, userIds[0]);
  check(created.data.job.applicantsCount, 0);
  assert.notEqual(created.data.job.postedDate, '2000-01-01'); checks++;
  check((await Job.findById(id)).title, details.title);
  check((await call('/jobs/' + id, { token: owner })).data.job.title, details.title);
  check((await call('/jobs/' + id, { token: candidate })).status, 200);
  check((await call('/jobs/' + id, { token: other })).status, 403);
  check((await call('/jobs/my', { token: owner })).data.jobs.some(job => job.id === id), true);
  check((await call('/jobs/my', { token: other })).data.jobs.some(job => job.id === id), false);
  for (const query of [`search=${encodeURIComponent(details.title)}`, `search=${encodeURIComponent(details.company)}`, `search=${suffix}&location=colombo&jobType=Full%20Time`]) {
    const list = await call('/jobs?' + query, { token: candidate });
    check(list.status, 200); check(list.data.jobs.some(job => job.id === id), true);
  }
  check((await call(`/jobs?search=${suffix}&location=Galle`, { token: candidate })).data.jobs.length, 0);
  check((await call('/jobs?search[$ne]=anything', { token: candidate })).status, 400);
  check((await call('/jobs/not-an-id', { token: candidate })).status, 400);
  check((await call('/jobs/' + new mongoose.Types.ObjectId(), { token: owner })).status, 404);
  for (const token of [candidate, other]) {
    check((await call('/jobs/' + id, { method: 'PUT', body: { title: 'Unauthorized' }, token })).status, 403);
    check((await call('/jobs/' + id, { method: 'DELETE', token })).status, 403);
    check((await call('/jobs/' + id + '/status', { method: 'PATCH', body: { status: 'closed' }, token })).status, 403);
  }
  const updated = await call('/jobs/' + id, { method: 'PUT', body: { title: 'Updated ' + suffix, recruiter: userIds[1], applicantsCount: 999 }, token: owner });
  check(updated.status, 200); check(updated.data.job.recruiter, userIds[0]); check(updated.data.job.applicantsCount, 0);
  check((await Job.findById(id)).title, 'Updated ' + suffix);
  check((await call('/jobs/' + id, { method: 'PUT', body: { salaryMax: 1 }, token: owner })).status, 400);
  check((await call('/jobs/' + id + '/status', { method: 'PATCH', body: { status: 'bad' }, token: owner })).status, 400);
  check((await call('/jobs/' + id + '/status', { method: 'PATCH', body: { status: 'closed' }, token: owner })).status, 200);
  check((await call('/jobs/' + id, { token: candidate })).status, 404);
  check((await call('/jobs?search=' + suffix, { token: candidate })).data.jobs.length, 0);
  check((await call('/jobs/' + id, { token: owner })).data.job.status, 'closed');
  check((await call('/jobs/' + id + '/status', { method: 'PATCH', body: { status: 'active' }, token: owner })).status, 200);
  const expired = jwt.sign({}, process.env.JWT_SECRET, { subject: userIds[0], expiresIn: -1, issuer: 'jobrecruit-api', audience: 'jobrecruit-frontend' });
  check((await call('/jobs/my', { token: expired })).status, 401);
  check((await call('/jobs/my', { token: 'invalid-token' })).status, 401);
  check((await call('/jobs/' + id, { method: 'DELETE', token: owner })).status, 200);
  check(await Job.findById(id), null);
  check((await call('/jobs/' + id, { method: 'DELETE', token: owner })).status, 404);
  // Exercise the real frontend service against MongoDB-backed endpoints.
  const authSource = (await readFile(new URL('../../frontend/src/services/authService.js', import.meta.url), 'utf8')).replace('import.meta.env.VITE_API_URL', JSON.stringify(base));
  const authUrl = 'data:text/javascript;base64,' + Buffer.from(authSource).toString('base64');
  const serviceSource = (await readFile(new URL('../../frontend/src/services/jobService.js', import.meta.url), 'utf8')).replace("'./authService'", JSON.stringify(authUrl)).replace('import.meta.env.VITE_API_URL', JSON.stringify(base));
  const storage = new Map();
  globalThis.sessionStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key) };
  globalThis.window = { location: { assign() {} } };
  const auth = await import(authUrl);
  const service = await import('data:text/javascript;base64,' + Buffer.from(serviceSource).toString('base64'));
  await auth.login(emails[0], password);
  const serviceJob = await service.createJob(details);
  check(serviceJob.type, 'Full Time'); check(serviceJob.salary, 'Rs. 100K - 150K');
  check((await service.getMyJobs()).some(job => job.id === serviceJob.id), true);
  check((await service.getJobs({ search: suffix })).some(job => job.id === serviceJob.id), true);
  check((await service.getJobById(serviceJob.id)).title, details.title);
  check((await service.updateJob(serviceJob.id, { title: 'Service Update' })).title, 'Service Update');
  check((await service.updateJobStatus(serviceJob.id, 'closed')).status, 'closed');
  await service.deleteJob(serviceJob.id);
  await assert.rejects(service.getJobById(serviceJob.id), error => error.status === 404); checks++;
  // Optional real-browser flow. Install Playwright outside the project and supply its module path.
  if (process.env.JOB_BROWSER_MODULE) {
    const { chromium } = await import(pathToFileURL(process.env.JOB_BROWSER_MODULE));
    browser = await chromium.launch({ channel: 'msedge', headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const dialogs = [];
    page.on('dialog', async dialog => { dialogs.push(dialog.message()); await dialog.accept(); });
    async function login(index) {
      await page.goto(frontend + '/login');
      await page.locator('#email').fill(emails[index]);
      await page.locator('#password').fill(password);
      await page.getByRole('button', { name: 'Login', exact: true }).click();
      await page.waitForURL('**/home');
      checks++;
    }
    await login(0);
    await page.goto(frontend + '/recruiter/jobs/new');
    await page.locator('#job-title').fill('Browser Job ' + suffix);
    await page.locator('#company').fill(details.company);
    await page.locator('#location').fill('Colombo');
    await page.locator('#salary-minimum').fill('100000');
    await page.locator('#salary-maximum').fill('150000');
    await page.locator('#description').fill(details.description);
    await page.locator('#requirements').fill('React experience, Testing');
    await page.locator('#skills').fill('React, Testing');
    await page.locator('#deadline').fill('2030-12-31');
    await page.getByRole('button', { name: 'Publish Job' }).click();
    await page.getByText('Job posted successfully!', { exact: true }).waitFor(); checks++;
    await page.goto(frontend + '/recruiter/jobs');
    await page.getByRole('heading', { name: 'Browser Job ' + suffix, exact: true }).waitFor(); checks++;
    check(await page.locator('.kpi-value').allTextContents(), ['1', '1', '0', '0']);
    await page.reload();
    await page.getByRole('heading', { name: 'Browser Job ' + suffix, exact: true }).waitFor(); checks++;
    const row = page.locator('.manage-job-row').filter({ hasText: suffix });
    await row.getByRole('link', { name: 'View', exact: true }).click();
    await page.getByRole('heading', { name: 'Browser Job ' + suffix, exact: true }).waitFor(); checks++;
    await page.goto(frontend + '/recruiter/jobs');
    await page.getByRole('link', { name: 'Edit', exact: true }).click();
    await page.locator('#edit-job-title').fill('Browser Edited ' + suffix);
    await page.getByRole('button', { name: 'Save Changes' }).click();
    await page.getByRole('heading', { name: 'Browser Edited ' + suffix, exact: true }).waitFor(); checks++;
    const browserJobId = new URL(page.url()).pathname.split('/').at(-1);
    await page.reload();
    await page.getByRole('heading', { name: 'Browser Edited ' + suffix, exact: true }).waitFor(); checks++;
    await page.goto(frontend + '/recruiter/jobs');
    await page.getByRole('searchbox', { name: 'Search jobs by title, company, or location' }).fill('No match ' + suffix);
    await page.getByText('No jobs found', { exact: true }).waitFor(); checks++;
    await page.getByRole('searchbox', { name: 'Search jobs by title, company, or location' }).fill('Colombo');
    await page.getByRole('heading', { name: 'Browser Edited ' + suffix, exact: true }).waitFor(); checks++;
    await page.getByRole('button', { name: 'Closed', exact: true }).click();
    await page.getByText('No jobs found', { exact: true }).waitFor(); checks++;
    await page.goto(frontend + '/recruiter/dashboard');
    await page.getByText('Browser Edited ' + suffix, { exact: true }).waitFor(); checks++;
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.waitForURL('**/login'); checks++;
    await page.goto(frontend + '/recruiter/jobs');
    await page.waitForURL('**/login'); checks++;
    await login(2);
    await page.goto(frontend + '/candidate/jobs');
    await page.getByPlaceholder('Job title or company').fill('Browser Edited ' + suffix);
    await page.getByRole('heading', { name: 'Browser Edited ' + suffix, exact: true }).waitFor(); checks++;
    await page.getByPlaceholder('e.g. Colombo').fill('Galle');
    await page.getByText('No jobs found', { exact: true }).waitFor(); checks++;
    await page.getByPlaceholder('e.g. Colombo').fill('Colombo');
    await page.getByRole('combobox').selectOption('Full Time');
    await page.getByRole('heading', { name: 'Browser Edited ' + suffix, exact: true }).waitFor(); checks++;
    await page.getByRole('link', { name: /View Job/ }).click();
    await page.getByRole('heading', { name: 'Browser Edited ' + suffix, exact: true }).waitFor();
    await page.getByRole('button', { name: 'Apply Now' }).waitFor(); checks++;
    await page.goto(frontend + '/candidate/dashboard');
    await page.locator('.recommended-jobs').getByRole('heading', { name: 'Browser Edited ' + suffix, exact: true }).waitFor(); checks++;
    await page.locator('.recommended-jobs .job-card').filter({ hasText: suffix }).getByRole('link', { name: 'View Job', exact: true }).click();
    await page.getByRole('heading', { name: 'Browser Edited ' + suffix, exact: true }).waitFor(); checks++;
    await page.route(base + '/jobs?**', route => route.abort());
    await page.goto(frontend + '/candidate/jobs');
    await page.getByText('Cannot reach the backend. Check that it is running on port 5000.', { exact: true }).waitFor(); checks++;
    await page.unroute(base + '/jobs?**');
    await page.goto(frontend + '/candidate/jobs/not-an-id');
    await page.getByText('Invalid job ID', { exact: true }).waitFor(); checks++;
    await page.goto(frontend + '/candidate/jobs/' + new mongoose.Types.ObjectId());
    await page.getByRole('heading', { name: 'Job Not Found', exact: true }).waitFor(); checks++;
    await page.goto(frontend + '/candidate/jobs');
    await page.getByRole('heading', { name: 'Browser Edited ' + suffix, exact: true }).waitFor();
    await page.evaluate(() => sessionStorage.setItem('jobrecruit.token', 'invalid-test-token'));
    await page.getByPlaceholder('Job title or company').fill('Expired session');
    await page.waitForURL('**/login'); checks++;
    check(await page.evaluate(() => sessionStorage.getItem('jobrecruit.token')), null);
    // Owner isolation in the existing edit form.
    await page.evaluate(() => sessionStorage.clear());
    await login(1);
    await page.goto(frontend + '/recruiter/jobs/' + browserJobId + '/edit');
    await page.getByText('Access denied. Only the owning recruiter can manage this job.', { exact: true }).waitFor(); checks++;
    check(errors, [], 'No uncaught browser errors');
    check(dialogs, [], 'No unexpected browser alerts');
    await browser.close(); browser = null;
  }
  console.log(`PASS: ${checks} job checks (MongoDB persistence, CRUD, filters, role/ownership security, JWT, real frontend service${process.env.JOB_BROWSER_MODULE ? ', and browser forms/navigation' : ''}).`);
} finally {
  if (browser) await browser.close();
  if (mongoose.connection.readyState === 1) {
    // Restrict cleanup to accounts and jobs created by this unique test run.
    await Job.deleteMany({ recruiter: { $in: userIds } });
    await User.deleteMany({ email: { $in: emails } });
  }
  await mongoose.disconnect();
}
