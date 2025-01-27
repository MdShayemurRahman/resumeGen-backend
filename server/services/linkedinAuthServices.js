import axios from 'axios';

import config from '../config/config.js';
import User from '../models/User.js';
import CV from '../models/CV.js';

const LINKEDIN_API = {
  AUTH_URL: 'https://www.linkedin.com/oauth/v2/authorization',
  TOKEN_URL: 'https://www.linkedin.com/oauth/v2/accessToken',
  PROFILE_URL: 'https://api.linkedin.com/v2/me',
  USER_INFO_URL: 'https://api.linkedin.com/v2/userinfo',
};

const linkedinAuthService = {
  initiateAuth: (req, res) => {
    // Generate a random state
    const state = Math.random().toString(36).substring(7);

    // Store state in session
    req.session.linkedinState = state;

    // Force session save
    req.session.save((err) => {
      if (err) {
        console.error('Session save error:', err);
        return res.status(500).send('Session error');
      }

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: config.LINKEDIN_CLIENT_ID,
        redirect_uri: config.LINKEDIN_CALLBACK_URL,
        state: state,
        scope: 'openid profile email',
      });

      // Debug logging
      console.log('Auth Initiated:');
      console.log('Generated state:', state);
      console.log('Session ID:', req.sessionID);
      console.log('Session state:', req.session.linkedinState);

      res.redirect(`${LINKEDIN_API.AUTH_URL}?${params.toString()}`);
    });
  },

  handleAuthCallback: async (req, res) => {
    const { code, state } = req.query;

    // Debug logging
    console.log('Callback received:');
    console.log('Received state:', state);
    console.log('Session ID:', req.sessionID);
    console.log('Session state:', req.session.linkedinState);

    // More lenient state check for debugging
    if (!state || !req.session.linkedinState) {
      console.error('State or session state missing');
      console.error('Received state:', state);
      console.error('Session state:', req.session.linkedinState);
      return res.status(400).send('State parameter missing');
    }

    if (state !== req.session.linkedinState) {
      console.error('State mismatch:');
      console.error('Received:', state);
      console.error('Expected:', req.session.linkedinState);
      return res.status(400).send('Invalid state parameter');
    }

    // Rest of your callback handling code...
    try {
      const tokenResponse = await axios.post(LINKEDIN_API.TOKEN_URL, null, {
        params: {
          grant_type: 'authorization_code',
          code,
          client_id: config.LINKEDIN_CLIENT_ID,
          client_secret: config.LINKEDIN_CLIENT_SECRET,
          redirect_uri: config.LINKEDIN_CALLBACK_URL,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // ... rest of your existing code ...

      // Clear the linkedinState after successful use
      delete req.session.linkedinState;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          resolve();
        });
      });

      const redirectUrl = `${config.FRONTEND_URL}/profile/${existingUser._id}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('LinkedIn OAuth Error:', error.response?.data || error);
      res.status(500).send('Authentication failed');
    }
  },
};

export default linkedinAuthService;