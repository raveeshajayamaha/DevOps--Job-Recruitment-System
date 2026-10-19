import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

export async function authenticate(req, res, next) {
  const match = /^Bearer ([^\s]+)$/i.exec(req.get('authorization') || '');
  if (!match) return res.status(401).json({ success: false, message: 'Authentication required' });

  let payload;
  try {
    payload = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ['HS256'], issuer: 'jobrecruit-api', audience: 'jobrecruit-frontend',
    });
    if (typeof payload !== 'object' || !mongoose.isValidObjectId(payload.sub)) {
      throw new Error('Invalid subject');
    }
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
  }

  try {
    // Always load the current database role; never trust a client-supplied role.
    req.user = await User.findById(payload.sub);
    if (!req.user) return res.status(401).json({ success: false, message: 'Account no longer exists' });
    next();
  } catch (err) {
    next(err);
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
}
