import express from 'express';
import {
  initiateAuth,
  handleAuthCallback,
  handleLogOut,
} from '../controllers/linkedinController.js';

const linkedinRouter = express.Router();

linkedinRouter.get('/linkedin', initiateAuth);
linkedinRouter.get('/linkedin/callback', handleAuthCallback);
linkedinRouter.post('/logout', handleLogOut);
linkedinRouter.get('/checkAuth', (req, res) => {
  if (req.session.user) {
    res.status(200).json({ isAuthenticated: true });
  } else {
    res.status(200).json({ isAuthenticated: false });
  }
});

export default linkedinRouter;
