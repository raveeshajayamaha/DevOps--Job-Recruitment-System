import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true, maxlength: 100 },
  lastName: { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 254,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['candidate', 'recruiter', 'admin'], required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  tokenVersion: { type: Number, default: 0, select: false },
  profile: {
    phone: { type: String, default: '', maxlength: 50 },
    location: { type: String, default: '', maxlength: 200 },
    summary: { type: String, default: '', maxlength: 5000 },
    skills: { type: String, default: '', maxlength: 2000 },
    education: { type: String, default: '', maxlength: 5000 },
    experience: { type: String, default: '', maxlength: 5000 },
    jobTitle: { type: String, default: '', maxlength: 200 },
    company: { type: String, default: '', maxlength: 200 },
    professionalSummary: { type: String, default: '', maxlength: 5000 },
  },
  preferences: {
    recommendations: { type: Boolean, default: true },
    applications: { type: Boolean, default: true },
    interviews: { type: Boolean, default: true },
    visibility: { type: String, enum: ['Public', 'Recruiters only', 'Private'], default: 'Public' },
    emailNotifications: { type: Boolean, default: true },
    interviewReminders: { type: Boolean, default: true },
    applicationNotifications: { type: Boolean, default: true },
    jobPostingNotifications: { type: Boolean, default: false },
    compactView: { type: Boolean, default: false },
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);
