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

export const handleLogOut = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error during session destruction:', err);
    }
    res.clearCookie().status(200).send('Logged out successfully');
  });
};

