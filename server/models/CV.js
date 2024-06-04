import mongoose from 'mongoose';

import EducationSchema from './Education.js';
import ProjectSchema from './Project.js';
import ExperienceSchema from './Experience.js';

const CVSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    headline: String,
    phone: String,
    skills: [String],
    education: [EducationSchema],
    projects: [ProjectSchema],
    experience: [ExperienceSchema],
  },
  { timestamps: true, versionKey: false }
);

const CV = mongoose.model('CV', CVSchema);

export default CV;
