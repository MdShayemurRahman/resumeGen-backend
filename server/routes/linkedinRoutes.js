import express from 'express';
import {
  initiateAuth,
  handleAuthCallback,
  handleLogOut
} from '../controllers/linkedinController.js';

const linkedinRouter = express.Router();

linkedinRouter.get('/auth/linkedin', initiateAuth);
linkedinRouter.get('/auth/linkedin/callback', handleAuthCallback);
linkedinRouter.post('/logout', handleLogOut);

export default linkedinRouter;

