// routes/router.resume.js
import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  createResume,
  importFromLinkedIn,
  getUserResumes,
  getResume,
  updateResume,
  deleteResume,
  getPublicResume,
} from '../controllers/resume/controller.resume.js';

const resumeRouter = express.Router();

// Public routes
resumeRouter.get('/public/:slug', getPublicResume);

// Protected routes
resumeRouter.use(verifyToken);

resumeRouter.post('/', createResume);
resumeRouter.post('/import-linkedin', importFromLinkedIn);
resumeRouter.get('/', getUserResumes);
resumeRouter.get('/:id', getResume);
resumeRouter.put('/:id', updateResume);
resumeRouter.delete('/:id', deleteResume);

export default resumeRouter;
