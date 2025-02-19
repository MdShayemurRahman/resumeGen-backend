import mongoose from 'mongoose';
import slugify from 'slugify';
import {
  personalInfoSchema,
  experienceSchema,
  educationSchema,
  skillSchema,
  languageSchema,
  projectSchema,
  certificationSchema,
  referenceSchema,
  resumeMetadataSchema,
} from '../schemas/resume.schema.js';

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ...resumeMetadataSchema,
    personalInfo: personalInfoSchema,
    summary: String,
    experience: [experienceSchema],
    education: [educationSchema],
    skills: [skillSchema],
    languages: [languageSchema],
    projects: [projectSchema],
    certifications: [certificationSchema],
    interests: [String],
    references: [referenceSchema],
    customSections: [
      {
        title: String,
        content: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Define indexes
resumeSchema.index({ user: 1 });
resumeSchema.index({ slug: 1 }); // Keep only this one, remove from resumeMetadataSchema
resumeSchema.index({ isPublic: 1 });

// Generate slug before saving
resumeSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = slugify(`${this.title}-${this._id}`, { lower: true });
  }
  next();
});

// Instance methods
resumeSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

// Static methods
resumeSchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug });
};

resumeSchema.statics.findPublicResumes = function () {
  return this.find({ isPublic: true });
};

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;
