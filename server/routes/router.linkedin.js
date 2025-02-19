import express from 'express';
import { validateRequest } from '../middlewares/validation.middleware.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  initiateAuth,
  handleAuthCallback,
  handleLogout,
  importLinkedInProfile,
  checkLinkedInAuth,
} from '../controllers/auth/controller.linkedinAuth.js';

const linkedinRouter = express.Router();

// Public routes with validation
linkedinRouter.get('/', initiateAuth);

linkedinRouter.get(
  '/callback',
  validateRequest('linkedinToken'),
  handleAuthCallback
);

// Protected routes with validation
linkedinRouter.use(verifyToken);
linkedinRouter.post('/logout', handleLogout);
linkedinRouter.post(
  '/profile/import',
  validateRequest('linkedinProfileImport'),
  importLinkedInProfile
);
linkedinRouter.get('/check', checkLinkedInAuth);

export default linkedinRouter;
