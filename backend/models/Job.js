import mongoose from 'mongoose';

export const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Hybrid', 'Remote'];
export const experienceLevels = ['Entry Level', 'Mid Level', 'Senior Level'];
const text = (max) => ({ type: String, required: true, trim: true, maxlength: max });
const jobSchema = new mongoose.Schema({
  title: text(200),
  company: text(200),
  location: text(200),
  jobType: { type: String, required: true, enum: jobTypes },
  salaryMin: { type: Number, min: 0, default: 0 },
  salaryMax: { type: Number, min: 0, default: 0 },
  experienceLevel: { type: String, required: true, enum: experienceLevels },
  description: text(20000),
  requirements: { type: [text(1000)], required: true, validate: v => v.length > 0 && v.length <= 100 },
  skills: { type: [text(100)], default: [], validate: v => v.length <= 100 },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  applicantsCount: { type: Number, min: 0, default: 0 },
  postedDate: { type: Date, default: Date.now, immutable: true },
  deadline: { type: Date, required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
}, { timestamps: true });
jobSchema.pre('validate', function () {
  if (this.salaryMax < this.salaryMin) this.invalidate('salaryMax', 'Maximum salary must be greater than or equal to minimum salary');
});
jobSchema.index({ recruiter: 1, createdAt: -1 });
jobSchema.index({ status: 1, createdAt: -1 });
export default mongoose.model('Job', jobSchema);
