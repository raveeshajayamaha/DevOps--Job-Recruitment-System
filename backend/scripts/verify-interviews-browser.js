import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Interview, { InterviewRound } from '../models/Interview.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

dotenv.config({ path: new URL('../.env', import.meta.url), quiet: true });
const base = process.env.INTERVIEW_TEST_URL || 'http://localhost:5000/api';
const site = process.env.BROWSER_TEST_URL || 'http://localhost:5173';
const suffix = randomUUID();
const emails = ['candidate', 'other-candidate', 'recruiter', 'other-recruiter'].map(role => 'interview-browser-' + role + '-' + suffix + '@example.com');
const password = 'BrowserTest!23456';
const userIds = [], applicationIds = [];
const profile = await mkdtemp(path.join(tmpdir(), 'jobrecruit-edge-'));
let edge, ws, sequence = 0, checks = 0;
const pending = new Map();
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function api(route, { token, body, method = body ? 'POST' : 'GET' } = {}) {
  const response = await fetch(base + route, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  assert.ok(response.ok, JSON.stringify(data)); return data;
}
function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 15000);
    pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function until(expression, label) {
  for (let i = 0; i < 100; i++) {
    if (await evaluate(expression)) { checks++; return; }
    await delay(100);
  }
  throw new Error('Browser timeout: ' + label + '\n' + await evaluate('document.body.innerText'));
}
async function navigate(route) {
  await command('Page.navigate', { url: site + route });
  await until('location.pathname === ' + JSON.stringify(route) + ' && document.readyState === "complete"', route);
}
async function fill(selector, value) {
  await evaluate('(() => { const el = document.querySelector(' + JSON.stringify(selector) + '); if (!el) throw new Error("Missing input"); const proto = el.tagName === "SELECT" ? HTMLSelectElement.prototype : el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(proto, "value").set.call(el, ' + JSON.stringify(value) + '); el.dispatchEvent(new Event(el.tagName === "SELECT" ? "change" : "input", { bubbles: true })); })()');
}
async function clickText(text) {
  await evaluate('(() => { const el = [...document.querySelectorAll("button,a")].find(el => el.textContent.trim() === ' + JSON.stringify(text) + '); if (!el) throw new Error("Missing action"); el.click(); })()');
}
async function login(index) {
  await navigate('/login');
  await until('!!document.querySelector("#email")', 'login form');
  await fill('#email', emails[index]); await fill('#password', password);
  await clickText('Login');
  await until('location.pathname === "/home" && !!sessionStorage.getItem("jobrecruit.token")', 'login success');
}
async function schedule(applicationId) {
  await navigate('/recruiter/applications/' + applicationId);
  await until('!![...document.querySelectorAll("a")].find(el => el.textContent.includes("Schedule") && el.href.includes("/schedule/"))', 'schedule action');
  await evaluate('[...document.querySelectorAll("a")].find(el => el.href.includes("/interviews/schedule/")).click()');
  await until('!!document.querySelector(".schedule-form")', 'schedule form');
  await fill('[aria-label="Interview date"]', '2027-06-15');
  await fill('[aria-label="Interview time"]', '10:30');
  await fill('[aria-label="Meeting link"]', 'https://example.com/browser-meeting');
  await fill('[aria-label="Interview notes"]', 'Browser verified round');
  await clickText('Schedule Interview');
  await until('!!document.querySelector(".interview-details-grid")', 'saved detail');
  return evaluate('location.pathname.split("/").at(-1)');
}
try {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  const tokens = [];
  for (let i = 0; i < emails.length; i++) {
    const registered = await api('/auth/register', { body: { firstName: 'Browser', lastName: 'Test', email: emails[i], password, confirmPassword: password, role: i < 2 ? 'candidate' : 'recruiter' } });
    userIds.push(registered.user.id);
    tokens.push((await api('/auth/login', { body: { email: emails[i], password } })).token);
  }
  const job = (await api('/jobs', { token: tokens[2], body: { title: 'Browser interview ' + suffix, company: 'Browser Company', location: 'Colombo', jobType: 'Full-time', experienceLevel: 'Entry Level', description: 'Temporary browser fixture', requirements: ['Testing'], deadline: '2030-12-31' } })).job;
  const application = (await api('/applications', { token: tokens[0], body: { jobId: job.id } })).application;
  applicationIds.push(application.id);
  await api('/applications/' + application.id + '/status', { token: tokens[2], method: 'PATCH', body: { status: 'shortlisted' } });
  edge = spawn(process.env.EDGE_PATH || 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=9335', '--user-data-dir=' + profile, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  edge.on('error', error => console.error('Edge launch failed:', error.message));
  let target;
  for (let i = 0; i < 100; i++) {
    try { target = (await (await fetch('http://localhost:9335/json/list')).json()).find(item => item.type === 'page'); if (target) break; } catch {}
    await delay(100);
  }
  assert.ok(target, 'Edge debugging endpoint');
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  ws.onmessage = event => {
    const data = JSON.parse(event.data), task = pending.get(data.id);
    if (!task) return; clearTimeout(task.timer); pending.delete(data.id);
    if (data.error) task.reject(new Error(data.error.message)); else task.resolve(data.result);
  };
  await command('Page.enable');
  await login(2);
  await navigate('/recruiter/applications');
  await until('document.body.innerText.includes(' + JSON.stringify(job.title) + ')', 'application list');
  const firstId = await schedule(application.id);
  assert.equal((await Interview.findById(firstId)).status, 'scheduled'); checks++;
  await command('Page.reload');
  await until('!!document.querySelector(".recruiter-status.scheduled")', 'scheduled after reload');
  await clickText('Mark Completed');
  await until('!!document.querySelector(".recruiter-status.completed")', 'completed');
  await command('Page.reload');
  await until('!!document.querySelector(".recruiter-status.completed")', 'completed persists');
  const secondId = await schedule(application.id);
  await clickText('Cancel Interview');
  await until('!!document.querySelector(".recruiter-status.cancelled")', 'cancelled');
  await command('Page.reload');
  await until('!!document.querySelector(".recruiter-status.cancelled")', 'cancelled persists');
  const thirdId = await schedule(application.id);
  assert.equal((await Interview.findById(thirdId)).round, 3); checks++;
  await navigate('/recruiter/interviews');
  await until('document.querySelectorAll(".interview-row").length === 3', 'recruiter list');
  await fill('[aria-label="Search interviews"]', 'does-not-exist');
  await until('document.querySelectorAll(".interview-row").length === 0', 'search');
  await fill('[aria-label="Search interviews"]', 'Browser');
  await fill('[aria-label="Filter interviews by status"]', 'completed');
  await until('document.querySelectorAll(".interview-row").length === 1', 'recruiter status filter');
  await login(0);
  await navigate('/candidate/interviews');
  await until('document.querySelectorAll(".interview-card").length === 3', 'candidate interviews');
  for (const status of ['Completed', 'Cancelled', 'Upcoming']) {
    await fill('.interview-filter select', status);
    await until('document.querySelectorAll(".interview-card").length === 1 && document.querySelector(".interview-status").textContent.trim() === ' + JSON.stringify(status), status + ' filter');
  }
  await command('Page.reload');
  await until('document.querySelectorAll(".interview-card").length === 3', 'candidate refresh');
  assert.equal(await evaluate('fetch(' + JSON.stringify(base + '/interviews/' + firstId + '/status') + ', { method: "PATCH", headers: { Authorization: "Bearer " + sessionStorage.getItem("jobrecruit.token"), "Content-Type": "application/json" }, body: JSON.stringify({status:"cancelled"}) }).then(r => r.status)'), 403); checks++;
  await login(1);
  await navigate('/candidate/interviews');
  await until('document.body.innerText.includes("No interviews found.")', 'other candidate empty');
  assert.equal(await evaluate('fetch(' + JSON.stringify(base + '/interviews/' + firstId) + ', { headers: { Authorization: "Bearer " + sessionStorage.getItem("jobrecruit.token") } }).then(r => r.status)'), 403); checks++;
  await login(3);
  await navigate('/recruiter/interviews/' + firstId);
  await until('document.querySelector("[role=alert]")?.textContent.includes("Access denied")', 'other recruiter blocked');
  assert.equal((await Interview.findById(firstId)).status, 'completed');
  assert.equal((await Interview.findById(secondId)).status, 'cancelled');
  console.log('PASS: ' + checks + ' headless Microsoft Edge checks (login, schedule multiple rounds, details, refresh persistence, complete/cancel, lists, filtering, search, and access controls).');
} finally {
  if (ws?.readyState === WebSocket.OPEN) {
    try { await command('Browser.close'); } catch {} ws.close();
  }
  if (edge && edge.exitCode === null) { await delay(500); edge.kill(); }
  if (mongoose.connection.readyState === 1) {
    await Interview.deleteMany({ candidateId: { $in: userIds } });
    await InterviewRound.deleteMany({ _id: { $in: applicationIds } });
    await Application.deleteMany({ candidate: { $in: userIds } });
    await Job.deleteMany({ recruiter: { $in: userIds } });
    await User.deleteMany({ email: { $in: emails } });
  }
  await mongoose.disconnect();
  // Only remove the exact temporary directory created by mkdtemp above.
  assert.equal(path.dirname(profile), tmpdir()); assert.ok(path.basename(profile).startsWith('jobrecruit-edge-'));
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 250 });
}
