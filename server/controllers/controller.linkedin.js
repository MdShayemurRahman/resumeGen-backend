import linkedinAuthService from '../services/linkedinAuthServices.js';

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

export const handleLogout = async (req, res) => {
  try {
    // Clear the session from MongoDB
    await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          console.error('Session destruction error:', err);
          reject(err);
          return;
        }
        resolve();
      });
    });

    // Clear the session cookie
    res.clearCookie('sessionId', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during logout',
    });
  }
};

export const handleCheckAuth = (req, res) => {
  if (req.session.user) {
    res.status(200).json({ isAuthenticated: true });
  } else {
    res.status(200).json({ isAuthenticated: false });
  }
};
