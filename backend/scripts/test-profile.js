import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Resume from '../models/Resume.js';
import ActivityLog from '../models/ActivityLog.js';
import { call, check, checks, fixture, jobBody, password, browserService, rejects } from './test-support.js';
const test = await fixture('profile-test');
try {
  const candidate = await test.add(), other = await test.add(), recruiter = await test.add('recruiter'), stranger = await test.add('recruiter');
  const token = candidate.token;
  for (const path of ['/profile', '/profile/settings', '/profile/resume/' + candidate.id]) check((await call(path)).status, 401);
  const initial = (await call('/profile', { token })).data;
  check(initial.profile.email, candidate.email); check(initial.resume, null); check(initial.profile.skills, '');
  check(Object.hasOwn(initial.profile, 'password'), false); check(Object.hasOwn(initial.profile, 'role'), false);
  const fields = { firstName: 'Updated', lastName: 'Candidate', phone: '+94771234567', location: 'Kandy', summary: 'Professional summary', skills: 'React, Node', education: 'Degree', experience: 'Engineer' };
  check((await call('/profile', { method: 'PATCH', token, body: fields })).status, 200);
  check((await User.findById(candidate.id)).profile.location, 'Kandy');
  for (const body of [{ role: 'admin' }, { password: 'anything' }, { email: other.email }, { status: 'active' }, { candidateId: other.id }, { firstName: '' }, { firstName: { $ne: null } }, { phone: ['bad'] }, { summary: 'a'.repeat(5001) }, [], {}, null]) {
    check((await call('/profile', { method: 'PATCH', token, body })).status, 400);
  }
  check((await User.findById(candidate.id)).role, 'candidate');
  check((await call('/profile', { token: other.token })).data.profile.firstName === 'Updated', false, 'Profile ownership');
  check((await call('/profile', { method: 'PATCH', token: recruiter.token, body: { company: 'Example', jobTitle: 'Hiring Manager', professionalSummary: 'Recruiter' } })).status, 200);
  check((await call('/profile', { token: recruiter.token })).data.profile.company, 'Example');
  check((await call('/profile', { method: 'PATCH', token, body: { company: 'wrong role' } })).status, 400);
  const settings = { recommendations: false, applications: true, interviews: false, visibility: 'Private' };
  check((await call('/profile/settings', { method: 'PATCH', token, body: settings })).data.settings, settings);
  for (const body of [{ visibility: 'Unknown' }, { interviews: 'true' }, { role: 'admin' }, { compactView: true }, { visibility: { $ne: null } }, {}]) {
    check((await call('/profile/settings', { method: 'PATCH', token, body })).status, 400);
  }
  check((await call('/profile/settings', { method: 'PATCH', token: recruiter.token, body: { compactView: true } })).data.settings.compactView, true);
  await mongoose.disconnect(); await mongoose.connect(process.env.MONGODB_URI);
  check((await call('/profile', { token })).data.profile.summary, fields.summary);
  check((await call('/profile/settings', { token })).data.settings, settings);
  // A bounded PDF, stored privately and always downloaded as an attachment.
  const pdf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF\n');
  const upload = (token, raw = pdf, name = 'Resume.pdf', type = 'application/pdf') => call('/profile/resume', { method: 'PUT', token, raw, headers: { 'Content-Type': type, 'X-Filename': name } });
  check((await upload(token)).status, 200); check((await Resume.findOne({ owner: candidate.id })).size, pdf.length);
  check((await call('/profile', { token })).data.resume.name, 'Resume.pdf');
  check((await upload(token, pdf, 'Replacement.pdf')).status, 200); check(await Resume.countDocuments({ owner: candidate.id }), 1);
  check((await upload(recruiter.token)).status, 403);
  check((await upload(token, Buffer.from('MZ executable'), 'Resume.pdf')).status, 400);
  check((await upload(token, pdf, 'Resume.exe')).status, 400);
  check((await upload(token, pdf, '../Resume.pdf')).status, 400);
  check((await upload(token, pdf, 'Resume.pdf', 'text/plain')).status, 400);
  check((await upload(token, Buffer.alloc(2 * 1024 * 1024 + 1))).status, 413);
  check((await call('/profile/resume/bad', { token })).status, 400);
  check((await call('/profile/resume/' + candidate.id, { token: other.token })).status, 403);
  check((await call('/profile/resume/' + candidate.id, { token: stranger.token })).status, 403);
  check((await call('/profile/resume/' + candidate.id, { token: recruiter.token })).status, 403);
  const job = await call('/jobs', { method: 'POST', token: recruiter.token, body: jobBody }); check(job.status, 201);
  check((await call('/applications', { method: 'POST', token, body: { jobId: job.data.job.id } })).status, 201);
  for (const allowed of [token, recruiter.token]) {
    const downloaded = await call('/profile/resume/' + candidate.id, { token: allowed });
    check(downloaded.status, 200); check(downloaded.data, pdf);
    check(downloaded.headers.get('content-disposition'), 'attachment; filename="Replacement.pdf"');
    check(downloaded.headers.get('cache-control'), 'no-store');
  }
  check((await call('/profile/resume/' + other.id, { token: other.token })).status, 404);
  const service = await browserService('profileService', token);
  check((await service.getProfile()).profile.firstName, 'Updated');
  check((await service.updateProfile({ location: 'Galle' })).location, 'Galle');
  check((await service.getSettings()).visibility, 'Private');
  check((await service.updateSettings({ visibility: 'Recruiters only' })).visibility, 'Recruiters only');
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => { throw new TypeError('Offline'); };
    await rejects(service.getProfile(), /Cannot reach the backend/);
    globalThis.fetch = async () => new Response('{}', { status: 500 });
    await rejects(service.getProfile(), /Please try again later/);
  } finally { globalThis.fetch = originalFetch; }
  for (const body of [{ role: 'admin' }, { email: 'bad', currentPassword: password }, { currentPassword: password, newPassword: 'short', confirmPassword: 'short' }, { currentPassword: password, newPassword: 'a'.repeat(73), confirmPassword: 'a'.repeat(73) }, { currentPassword: password, newPassword: password, confirmPassword: 'different' }, { currentPassword: password }]) {
    check((await call('/profile/account', { method: 'PATCH', token, body })).status, 400);
  }
  check((await call('/profile/account', { method: 'PATCH', token, body: { email: other.email, currentPassword: password } })).status, 409);
  check((await call('/profile/account', { method: 'PATCH', token, body: { email: candidate.email, currentPassword: 'wrong' } })).status, 401);
  const newPassword = 'ChangedPassword!123';
  const updated = await call('/profile/account', { method: 'PATCH', token, body: { currentPassword: password, newPassword, confirmPassword: newPassword } });
  check(updated.status, 200); check(typeof updated.data.token, 'string');
  check((await call('/auth/me', { token })).status, 401, 'Old tokens revoked');
  candidate.token = updated.data.token;
  check((await call('/auth/me', { token: candidate.token })).status, 200);
  check((await call('/auth/login', { method: 'POST', body: { email: candidate.email, password } })).status, 401);
  check((await call('/auth/login', { method: 'POST', body: { email: candidate.email, password: newPassword } })).status, 200);
  check(await bcrypt.compare(newPassword, (await User.findById(candidate.id).select('+password')).password), true);
  const email = `changed-${candidate.email}`;
  await browserService('profileService', candidate.token);
  check((await service.updateAccount({ email, currentPassword: newPassword })).email, email);
  check((await call('/auth/me', { token: candidate.token })).status, 401, 'Email change revokes prior tokens');
  candidate.token = sessionStorage.getItem('jobrecruit.token');
  check((await call('/auth/me', { token: candidate.token })).data.user.email, email);
  await User.updateOne({ _id: candidate.id }, { $set: { status: 'inactive' } });
  check((await call('/auth/login', { method: 'POST', body: { email, password: newPassword } })).status, 401);
  check((await call('/profile', { token: candidate.token })).status, 401);
  const actions = await ActivityLog.find({ actor: candidate.id }).select('action');
  for (const action of ['Profile updated', 'Preferences updated', 'Resume updated', 'Account credentials updated']) check(actions.some(item => item.action === action), true);
  console.log(`PASS: ${checks} profile checks (persistence, private PDF access, preferences, credentials, revocation, and frontend service).`);
} finally { await test.cleanup(); }
