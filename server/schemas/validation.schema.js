import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required');

const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters long')
  .max(100, 'Name must not exceed 100 characters')
  .regex(
    /^[a-zA-Z\s'-]+$/,
    'Name can only contain letters, spaces, hyphens and apostrophes'
  );

const phoneSchema = z
  .string()
  .regex(
    /^\+?[1-9]\d{1,14}$/,
    'Invalid phone number format. Please use international format (e.g., +1234567890)'
  );

const urlSchema = z.string().url('Invalid URL format').optional();

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

// Auth Schemas
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').min(1, 'Email is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters long')
      .max(100, 'Name must not exceed 100 characters')
      .regex(
        /^[a-zA-Z\s'-]+$/,
        'Name can only contain letters, spaces, hyphens and apostrophes'
      ),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: emailSchema,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: passwordSchema,
  }),
  params: z.object({
    token: z.string().min(1, 'Reset token is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
  }),
});

// Profile Schemas
const profileSchema = z.object({
  bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
  location: z
    .string()
    .max(100, 'Location must not exceed 100 characters')
    .optional(),
  phoneNumber: phoneSchema.optional(),
  website: urlSchema,
  profilePicture: urlSchema,
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: nameSchema,
    jobTitle: z
      .string()
      .max(100, 'Job title must not exceed 100 characters')
      .optional(),
    profile: profileSchema.optional(),
  }),
});

// Professional Info Schemas
const experienceSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  current: z.boolean().optional(),
  description: z
    .string()
    .max(2000, 'Description must not exceed 2000 characters')
    .optional(),
  highlights: z
    .array(z.string().max(200, 'Highlight must not exceed 200 characters'))
    .optional(),
  skills: z.array(z.string()).optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  current: z.boolean().optional(),
  gpa: z
    .string()
    .regex(/^\d*\.?\d*$/, 'Invalid GPA format')
    .optional(),
  highlights: z
    .array(z.string().max(200, 'Highlight must not exceed 200 characters'))
    .optional(),
});

const skillSchema = z.object({
  category: z.string().optional(),
  skills: z.array(
    z.object({
      name: z.string().min(1, 'Skill name is required'),
      level: z
        .enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
        .optional(),
    })
  ),
});

const languageSchema = z.object({
  name: z.string().min(1, 'Language name is required'),
  proficiency: z
    .enum([
      'Elementary',
      'Limited Working',
      'Professional Working',
      'Full Professional',
      'Native/Bilingual',
    ])
    .optional(),
});

const certificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().optional(),
  issueDate: dateSchema.optional(),
  expiryDate: dateSchema.optional(),
  credentialId: z.string().optional(),
  credentialUrl: urlSchema,
});

// Resume Schemas
export const createResumeSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Resume title is required'),
    isPublic: z.boolean().optional(),
    theme: z.string().optional(),
    personalInfo: z.object({
      name: nameSchema,
      jobTitle: z.string().optional(),
      email: emailSchema,
      phone: phoneSchema.optional(),
      address: z
        .object({
          street: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          country: z.string().optional(),
          zipCode: z.string().optional(),
        })
        .optional(),
      profilePicture: urlSchema,
      linkedinUrl: urlSchema,
      portfolioUrl: urlSchema,
      objective: z
        .string()
        .max(500, 'Objective must not exceed 500 characters')
        .optional(),
    }),
    summary: z
      .string()
      .max(2000, 'Summary must not exceed 2000 characters')
      .optional(),
    experience: z.array(experienceSchema).optional(),
    education: z.array(educationSchema).optional(),
    skills: z.array(skillSchema).optional(),
    languages: z.array(languageSchema).optional(),
    certifications: z.array(certificationSchema).optional(),
    interests: z.array(z.string()).optional(),
    customSections: z
      .array(
        z.object({
          title: z.string().min(1, 'Section title is required'),
          content: z.any(),
        })
      )
      .optional(),
  }),
});

export const updateResumeSchema = createResumeSchema.partial();

// LinkedIn Integration Schemas
export const linkedinTokenSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Authorization code is required'),
    state: z.string().min(1, 'State parameter is required'),
  }),
});

export const linkedinProfileImportSchema = z.object({
  body: z
    .object({
      importEducation: z.boolean().optional(),
      importExperience: z.boolean().optional(),
      importSkills: z.boolean().optional(),
      overwrite: z.boolean().optional(),
    })
    .optional(),
});

// Search and Filter Schemas
export const resumeSearchSchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
      skills: z.array(z.string()).optional(),
      dateRange: z
        .object({
          start: dateSchema.optional(),
          end: dateSchema.optional(),
        })
        .optional(),
      sortBy: z.enum(['createdAt', 'updatedAt', 'title']).optional(),
      sortOrder: z.enum(['asc', 'desc']).optional(),
      page: z.number().int().positive().optional(),
      limit: z
        .number()
        .int()
        .positive()
        .max(50, 'Maximum limit is 50')
        .optional(),
    })
    .optional(),
});

// Email Verification Schema
export const verifyEmailSchema = z.object({
  params: z.object({
    token: z.string().min(1, 'Verification token is required'),
  }),
});

// Export a helper function to validate dates
export const validateDateRange = (startDate, endDate) => {
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end >= start;
  }
  return true;
};
