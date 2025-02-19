import { z } from 'zod';

export const createDateRangeSchema = (options = {}) => {
  const { required = false, allowCurrentFlag = true } = options;

  let schema = z.object({
    startDate: required ? z.string() : z.string().optional(),
    endDate: z.string().optional(),
  });

  if (allowCurrentFlag) {
    schema = schema.extend({
      current: z.boolean().optional(),
    });
  }

  return schema.superRefine((data, ctx) => {
    if (data.startDate) {
      const start = new Date(data.startDate);
      if (isNaN(start.getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.invalid_date,
          message: 'Invalid start date',
          path: ['startDate'],
        });
        return;
      }

      if (data.endDate && !data.current) {
        const end = new Date(data.endDate);
        if (isNaN(end.getTime())) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_date,
            message: 'Invalid end date',
            path: ['endDate'],
          });
          return;
        }

        if (end < start) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'End date cannot be earlier than start date',
            path: ['endDate'],
          });
        }
      }
    }
  });
};

export const createPaginationSchema = (maxLimit = 50) => {
  return z.object({
    page: z.number().int().positive().optional().default(1),
    limit: z.number().int().positive().max(maxLimit).optional().default(10),
  });
};

export const createSortingSchema = (allowedFields) => {
  return z.object({
    sortBy: z.enum(allowedFields).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  });
};

export const validatePhoneNumber = (phoneNumber) => {
  // Supports various international formats
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phoneNumber);
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const createSearchSchema = (options = {}) => {
  const {
    searchFields = ['title', 'description'],
    maxSearchLength = 100,
    allowedFilters = {},
  } = options;

  const filterSchema = {};
  Object.entries(allowedFilters).forEach(([key, schema]) => {
    filterSchema[key] = schema;
  });

  return z.object({
    search: z.string().max(maxSearchLength).optional(),
    searchFields: z.array(z.enum(searchFields)).optional(),
    filters: z.object(filterSchema).optional(),
  });
};

export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
  } = options;

  const schema = z.object({
    size: z
      .number()
      .max(maxSize, `File size must not exceed ${maxSize / 1024 / 1024}MB`),
    mimetype: z.enum(
      allowedTypes,
      `File type must be one of: ${allowedTypes.join(', ')}`
    ),
  });

  return schema.safeParse(file);
};
