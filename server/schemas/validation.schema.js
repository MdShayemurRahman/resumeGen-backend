
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

// Auth Schemas
export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: nameSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
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

export const updateProfileSchema = z.object({
  body: z.object({
    name: nameSchema,
    jobTitle: z.string().optional(),
    profile: z
      .object({
        bio: z.string().optional(),
        location: z.string().optional(),
        phoneNumber: z.string().optional(),
        website: z.string().url('Invalid website URL').optional(),
      })
      .optional(),
  }),
});

// Resume Schemas
const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

const experienceSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().optional(),
  field: z.string().optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  current: z.boolean().optional(),
  gpa: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const createResumeSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Resume title is required'),
    personalInfo: z.object({
      name: nameSchema,
      jobTitle: z.string().optional(),
      email: emailSchema,
      phone: z.string().optional(),
      address: z
        .object({
          street: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          country: z.string().optional(),
          zipCode: z.string().optional(),
        })
        .optional(),
      profilePicture: z.string().url('Invalid profile picture URL').optional(),
      linkedinUrl: z.string().url('Invalid LinkedIn URL').optional(),
      portfolioUrl: z.string().url('Invalid portfolio URL').optional(),
    }),
    experience: z.array(experienceSchema).optional(),
    education: z.array(educationSchema).optional(),
    skills: z
      .array(
        z.object({
          category: z.string().optional(),
          skills: z.array(
            z.object({
              name: z.string().min(1, 'Skill name is required'),
              level: z
                .enum(['Beginner', 'Intermediate', 'Advanced', 'Expert'])
                .optional(),
            })
          ),
        })
      )
      .optional(),
  }),
});

export const updateResumeSchema = createResumeSchema.partial();
