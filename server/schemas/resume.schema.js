// models/Resume/schemas/resume.schema.js
import mongoose from 'mongoose';

export const personalInfoSchema = {
  name: {
    type: String,
    required: true,
    trim: true,
  },
  jobTitle: {
    type: String,
    required: false,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
    required: false,
  },
  address: {
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    country: { type: String, required: false },
    zipCode: { type: String, required: false },
  },
  profilePicture: { type: String, required: false },
  linkedinUrl: { type: String, required: false },
  portfolioUrl: { type: String, required: false },
  objective: { type: String, required: false },
};

export const experienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: { type: String, required: false },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: { type: Date, required: false },
  current: {
    type: Boolean,
    default: false,
  },
  description: { type: String, required: false },
  highlights: [{ type: String, required: false }],
  skills: [{ type: String, required: false }],
});

export const educationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: true,
  },
  degree: { type: String, required: false },
  field: { type: String, required: false },
  location: { type: String, required: false },
  startDate: { type: Date, required: false },
  endDate: { type: Date, required: false },
  current: {
    type: Boolean,
    default: false,
  },
  gpa: { type: String, required: false },
  highlights: [{ type: String, required: false }],
});

export const skillSchema = new mongoose.Schema({
  category: { type: String, required: false },
  skills: [
    {
      name: {
        type: String,
        required: true,
      },
      level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
        required: false,
      },
    },
  ],
});

export const languageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  proficiency: {
    type: String,
    enum: [
      'Elementary',
      'Limited Working',
      'Professional Working',
      'Full Professional',
      'Native/Bilingual',
    ],
    required: false,
  },
});

export const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: { type: String, required: false },
  url: { type: String, required: false },
  startDate: { type: Date, required: false },
  endDate: { type: Date, required: false },
  current: {
    type: Boolean,
    default: false,
  },
  highlights: [{ type: String, required: false }],
  skills: [{ type: String, required: false }],
});

export const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  issuer: { type: String, required: false },
  issueDate: { type: Date, required: false },
  expiryDate: { type: Date, required: false },
  credentialId: { type: String, required: false },
  credentialUrl: { type: String, required: false },
});

export const referenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  title: { type: String, required: false },
  company: { type: String, required: false },
  email: { type: String, required: false },
  phone: { type: String, required: false },
  relation: { type: String, required: false },
});

export const resumeMetadataSchema = {
  title: {
    type: String,
    required: true,
    default: 'Untitled Resume',
  },
  isPublic: {
    type: Boolean,
    default: false,
  },
  theme: {
    type: String,
    default: 'classic',
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  slug: {
    type: String
  },
};
