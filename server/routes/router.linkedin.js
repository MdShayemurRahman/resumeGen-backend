import express from 'express';
import {
  initiateAuth,
  handleAuthCallback,
  handleLogOut,
  handleCheckAuth,
} from '../controllers/controller.linkedin.js';

const linkedinRouter = express.Router();

linkedinRouter.get('/linkedin', initiateAuth);
linkedinRouter.get('/linkedin/callback', handleAuthCallback);
linkedinRouter.post('/logout', handleLogOut);
linkedinRouter.get('/checkAuth', handleCheckAuth);

export default linkedinRouter;
