import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import { validateRequest } from '../middlewares/validation.middleware.js';
import {
  createResume,
  importFromLinkedIn,
  getUserResumes,
  getResume,
  updateResume,
  deleteResume,
  getPublicResume,
} from '../controllers/resume/controller.resume.js';
import {
  createSearchSchema,
  createPaginationSchema,
} from '../utils/validation.util.js';
import { z } from 'zod';

const resumeRouter = express.Router();

// Public routes with validation
resumeRouter.get(
  '/public/:slug',
  validateRequest(
    createSearchSchema({
      searchFields: ['title', 'skills', 'experience.company'],
      allowedFilters: {
        isPublic: z.boolean(),
      },
    })
  ),
  getPublicResume
);

// Protected routes
resumeRouter.use(verifyToken);

resumeRouter.post('/', validateRequest('createResume'), createResume);

resumeRouter.post(
  '/import-linkedin',
  validateRequest('linkedinProfileImport'),
  importFromLinkedIn
);

resumeRouter.get(
  '/',
  validateRequest(
    createSearchSchema({
      searchFields: ['title', 'personalInfo.name', 'skills.name'],
      allowedFilters: {
        isPublic: z.boolean(),
      },
    })
  ),
  getUserResumes
);

resumeRouter.get('/:id', validateRequest('id'), getResume);

resumeRouter.put(
  '/:id',
  validateRequest('id'),
  validateRequest('updateResume'),
  updateResume
);

resumeRouter.delete('/:id', validateRequest('id'), deleteResume);

export default resumeRouter;
