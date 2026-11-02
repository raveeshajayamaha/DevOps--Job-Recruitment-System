import express, { Router } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Resume from '../models/Resume.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { recordActivity } from '../utils/activity.js';
import { signToken } from '../utils/auth.js';

const router = Router();
router.use(authenticate);
router.use((req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
const candidateFields = ['phone', 'location', 'summary', 'skills', 'education', 'experience'];
const recruiterFields = ['phone', 'location', 'jobTitle', 'company', 'professionalSummary'];
const settingsFields = role => role === 'candidate' ? ['recommendations', 'applications', 'interviews', 'visibility']
  : role === 'recruiter' ? ['emailNotifications', 'interviewReminders', 'applicationNotifications', 'jobPostingNotifications', 'compactView'] : [];
const fail = (message, status = 400) => Object.assign(new Error(message), { status });
function bodyObject(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw fail('Provide an object');
}
function text(value, max, required = false) {
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) throw fail('Invalid profile field');
  return value.trim();
}
function profile(user) {
  const fields = user.role === 'candidate' ? candidateFields : recruiterFields;
  return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email,
    ...Object.fromEntries(fields.map(key => [key, user.profile?.[key] || ''])) };
}
function settings(user) {
  return Object.fromEntries(settingsFields(user.role).map(key => [key, user.preferences[key]]));
}
router.get('/', async (req, res) => {
  const resume = await Resume.findOne({ owner: req.user._id });
  res.json({ success: true, profile: profile(req.user), resume: resume ? { name: resume.name, size: resume.size, updatedAt: resume.updatedAt } : null });
});
router.patch('/', async (req, res) => {
  bodyObject(req.body);
  const allowed = ['firstName', 'lastName', ...(req.user.role === 'candidate' ? candidateFields : recruiterFields)];
  if (!Object.keys(req.body).length || Object.keys(req.body).some(key => !allowed.includes(key))) throw fail('Unsupported profile fields; use account settings to change email or password');
  const updates = {};
  for (const [key, value] of Object.entries(req.body)) {
    const name = ['firstName', 'lastName'].includes(key);
    const max = name ? 100 : key === 'phone' ? 50 : ['location', 'company', 'jobTitle'].includes(key) ? 200 : key === 'skills' ? 2000 : 5000;
    updates[name ? key : `profile.${key}`] = text(value, max, name);
  }
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { returnDocument: 'after', runValidators: true });
  await recordActivity(req.user, 'Profile updated', 'User', 'User', user._id);
  res.json({ success: true, profile: profile(user) });
});
router.get('/settings', (req, res) => res.json({ success: true, settings: settings(req.user) }));
router.patch('/settings', async (req, res) => {
  bodyObject(req.body);
  const allowed = settingsFields(req.user.role);
  if (!Object.keys(req.body).length || Object.keys(req.body).some(key => !allowed.includes(key))) throw fail('Unsupported settings');
  const updates = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (key === 'visibility' ? !['Public', 'Recruiters only', 'Private'].includes(value) : typeof value !== 'boolean') throw fail('Invalid preference');
    updates[`preferences.${key}`] = value;
  }
  const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { returnDocument: 'after', runValidators: true });
  await recordActivity(req.user, 'Preferences updated', 'User', 'User', user._id);
  res.json({ success: true, settings: settings(user) });
});
router.patch('/account', async (req, res) => {
  bodyObject(req.body);
  const { email, currentPassword, newPassword, confirmPassword } = req.body;
  if (Object.keys(req.body).some(key => !['email', 'currentPassword', 'newPassword', 'confirmPassword'].includes(key))) throw fail('Unsupported account fields');
  if (typeof currentPassword !== 'string' || Buffer.byteLength(currentPassword) > 72) throw fail('Current password is required');
  const user = await User.findById(req.user._id).select('+password +tokenVersion');
  if (!await bcrypt.compare(currentPassword, user.password)) throw fail('Current password is incorrect', 401);
  if (email !== undefined) {
    if (typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw fail('Invalid email address');
    user.email = email.trim().toLowerCase();
  }
  if (newPassword !== undefined) {
    if (typeof newPassword !== 'string' || newPassword.length < 8 || Buffer.byteLength(newPassword) > 72 || newPassword !== confirmPassword) throw fail('Passwords must match and contain 8 characters to 72 UTF-8 bytes');
    user.password = await bcrypt.hash(newPassword, 12);
  }
  if (email === undefined && newPassword === undefined) throw fail('No account changes supplied');
  // Revoke all prior tokens on both credential changes, including this request's token.
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  await recordActivity(req.user, 'Account credentials updated', 'User', 'User', user._id);
  res.json({ success: true, token: signToken(user), profile: profile(user) });
});
router.put('/resume', authorize('candidate'), express.raw({ type: 'application/pdf', limit: '2mb' }), async (req, res) => {
  const data = req.body;
  const name = req.get('x-filename') || 'resume.pdf';
  if (!Buffer.isBuffer(data) || data.length < 12 || !data.subarray(0, 5).equals(Buffer.from('%PDF-')) || !data.subarray(-1024).includes(Buffer.from('%%EOF'))
    || !/^[a-zA-Z0-9 _().-]{1,146}\.pdf$/i.test(name)) throw fail('Upload a PDF resume with a safe .pdf filename (maximum 2 MB)');
  const resume = await Resume.findOneAndUpdate({ owner: req.user._id }, { $set: { name, data, size: data.length } }, { upsert: true, returnDocument: 'after', runValidators: true });
  await recordActivity(req.user, 'Resume updated', 'User', 'Resume', resume._id);
  res.json({ success: true, resume: { name: resume.name, size: resume.size, updatedAt: resume.updatedAt } });
});
router.get('/resume/:candidateId', authorize('candidate', 'recruiter', 'admin'), async (req, res) => {
  const id = req.params.candidateId;
  if (!/^[a-f\d]{24}$/i.test(id) || !mongoose.isValidObjectId(id)) throw fail('Invalid candidate ID');
  if (req.user.id !== id && req.user.role !== 'admin') {
    if (req.user.role !== 'recruiter') throw fail('Access denied', 403);
    const jobs = await Job.find({ recruiter: req.user._id }).select('_id');
    if (!await Application.exists({ candidate: id, job: { $in: jobs.map(job => job._id) } })) throw fail('Access denied', 403);
  }
  const resume = await Resume.findOne({ owner: id }).select('+data');
  if (!resume) throw fail('Resume not found', 404);
  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${resume.name}"`, 'X-Content-Type-Options': 'nosniff' });
  res.send(resume.data);
});
export default router;
