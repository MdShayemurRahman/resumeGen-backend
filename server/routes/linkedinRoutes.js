import express from 'express';
import {
  initiateAuth,
  handleAuthCallback,
} from '../controllers/linkedinController.js';

const linkedinRouter = express.Router();

linkedinRouter.get('/auth/linkedin', initiateAuth);
linkedinRouter.get('/auth/linkedin/callback', handleAuthCallback);


export default linkedinRouter;
