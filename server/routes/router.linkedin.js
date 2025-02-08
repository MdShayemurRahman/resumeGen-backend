// routes/linkedin.router.js
import express from 'express';
import {
  initiateAuth,
  handleAuthCallback,
  handleLogout,
  importLinkedInProfile,
  checkLinkedInAuth,
} from '../controllers/auth/controller.linkedinAuth.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const linkedinRouter = express.Router();

// Public routes
linkedinRouter.get('/', initiateAuth);
linkedinRouter.get('/callback', handleAuthCallback);

// Protected routes (require authentication)
linkedinRouter.use(verifyToken);
linkedinRouter.post('/logout', handleLogout);
linkedinRouter.get('/profile/import', importLinkedInProfile);
linkedinRouter.get('/check', checkLinkedInAuth);

export default linkedinRouter;
