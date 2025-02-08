// schemas/user.schema.js
import mongoose from 'mongoose';

export const basicInfoSchema = {
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  jobTitle: {
    type: String,
    default: '',
    trim: true,
  },
};

// Authentication Schema
export const authSchema = {
  password: {
    type: String,
    select: false,
    minlength: 8,
    required: function () {
      return this.authType === 'local';
    },
  },
  authType: {
    type: String,
    required: true,
    enum: ['local', 'linkedin'],
    default: 'local',
  },
  linkedinId: {
    type: String,
    unique: true,
    sparse: true,
  },
  linkedinTokens: {
    accessToken: String,
    refreshToken: String,
    expiresIn: Number,
    issuedAt: Date,
  },
};

// Account Status Schema
export const accountStatusSchema = {
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
};

// Security Schema
export const securitySchema = {
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verificationToken: String,
  verificationTokenExpires: Date,
};

export const profileSchema = {
  profile: {
    bio: String,
    location: String,
    phoneNumber: String,
    website: String,
    profilePicture: String,
  },
};

// Professional Info Schema
export const professionalInfoSchema = {
  professionalInfo: {
    skills: [String],
    experience: [
      {
        company: String,
        position: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
        credentialUrl: String,
      },
    ],
  },
};
