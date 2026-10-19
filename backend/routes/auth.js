import { Router } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import { publicUser, signToken } from '../utils/auth.js';

const router = Router();
const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const validEmail = (value) => isText(value) && value.trim().length <= 254 &&
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

router.post('/register', async (req, res, next) => {
  const { firstName, lastName, email, password, confirmPassword, role } = req.body || {};
  if (![firstName, lastName, email, password, confirmPassword, role].every(isText)) {
    return res.status(400).json({ success: false, message: 'All registration fields are required' });
  }
  if (!['candidate', 'recruiter'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Account type must be Candidate or Recruiter' });
  }
  if (firstName.trim().length > 100 || lastName.trim().length > 100 || !validEmail(email)) {
    return res.status(400).json({ success: false, message: 'Enter valid names (up to 100 characters) and email address' });
  }
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ success: false, message: 'Password must be at least 8 characters and at most 72 UTF-8 bytes' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match' });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }
    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      firstName: firstName.trim(), lastName: lastName.trim(), email: normalizedEmail,
      password: hash, role,
    });
    // Registration saves the account; login is a separate step.
    res.status(201).json({ success: true, message: 'Account created. Please log in.', user: publicUser(user) });
  } catch (err) {
    // The unique index also protects simultaneous registrations.
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: 'Invalid registration details' });
    }
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  const { email, password } = req.body || {};
  if (!validEmail(email) || !isText(password) || Buffer.byteLength(password, 'utf8') > 72) {
    return res.status(400).json({ success: false, message: 'Enter a valid email and password' });
  }
  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    res.json({ success: true, message: 'Login successful', token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

export default router;
