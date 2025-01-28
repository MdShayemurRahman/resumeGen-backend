import mongoose from 'mongoose';
import EducationSchema from './Education.js';
import ProjectSchema from './Project.js';
import ExperienceSchema from './Experience.js';
import LanguageSchema from './Language.js';
import CertificationSchema from './Certification.js';

const CVSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    headline: {
      type: String,
      trim: true,
    },
    summery: {
      type: String,
      trim: true,
    },
    githubURL: {
      type: String,
      trim: true,
      match: [
        /^https?:\/\/(www\.)?github\.com\/[\w-]+\/?$/,
        'Please enter a valid GitHub URL',
      ],
    },
    summary: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[\d\s-]{10,}$/, 'Please enter a valid phone number'],
    },
    skills: {
      type: [String],
      default: [],
    },
    education: {
      type: [EducationSchema],
      default: [],
    },
    projects: {
      type: [ProjectSchema],
      default: [],
    },
    experience: {
      type: [ExperienceSchema],
      default: [],
    },
    languages: {
      type: [LanguageSchema],
      default: [],
    },
    certifications: {
      type: [CertificationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const CV = mongoose.model('CV', CVSchema);
export default CV;
