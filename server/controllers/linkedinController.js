import linkedinAuthService from '../services/linkedinAuthService.js';

export const initiateAuth = (req, res) => {
  linkedinAuthService.initiateAuth(req, res);
};

export const handleAuthCallback = async (req, res) => {
  try {
    await linkedinAuthService.handleAuthCallback(req, res);
  } catch (error) {
    console.error('Error during LinkedIn OAuth callback:', error);
    res.status(500).send('Authentication failed');
  }
};
