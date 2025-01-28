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
  initiateAuth: async (req, res) => {
    try {
      const state = Math.random().toString(36).substring(7);

      // Store the state in session
      req.session.linkedinState = state;

      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            reject(err);
            return;
          }
          resolve();
        });
      });

      console.log('Generated state:', state);
      console.log('Session after save:', req.session);

      const params = new URLSearchParams({
        response_type: 'code',
        client_id: config.LINKEDIN_CLIENT_ID,
        redirect_uri: config.LINKEDIN_CALLBACK_URL,
        state: state,
        scope: 'openid profile email r_basicprofile',
      });

      const authUrl = `${LINKEDIN_API.AUTH_URL}?${params.toString()}`;
      console.log('Redirecting to:', authUrl);

      res.redirect(authUrl);
    } catch (error) {
      console.error('Error in initiateAuth:', error);
      res.status(500).send('Failed to initiate authentication');
    }
  },

  handleAuthCallback: async (req, res) => {
    const { code, state } = req.query;

    console.log('Callback received');
    console.log('Session:', req.session);
    console.log('Received state:', state);
    console.log('Session state:', req.session.linkedinState);

    if (!code) {
      console.error('No code received');
      return res.status(400).send('Authorization code missing');
    }

    // Temporary more permissive state check for debugging
    if (state) {
      console.log('State verification:', {
        received: state,
        stored: req.session.linkedinState,
        matches: state === req.session.linkedinState,
      });
    }

    // Verify state parameter
    // if (!state || state !== req.session.linkedinState) {
    //   console.error('State mismatch or missing');
    //   console.error('Received state:', state);
    //   console.error('Session state:', req.session.linkedinState);
    //   return res.status(400).send('Invalid state parameter');
    // }

    try {
      console.log('Requesting access token...');
      const tokenResponse = await axios.post(LINKEDIN_API.TOKEN_URL, null, {
        params: {
          grant_type: 'authorization_code',
          code,
          client_id: config.LINKEDIN_CLIENT_ID,
          client_secret: config.LINKEDIN_CLIENT_SECRET,
          redirect_uri: config.LINKEDIN_CALLBACK_URL,
        },
        headers: {
          // 'Content-Type': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = tokenResponse.data;
      console.log('Access token received');

      // Get user profile data
      console.log('Fetching user profile...');
      const [profileResponse, userInfoResponse] = await Promise.all([
        axios.get(LINKEDIN_API.PROFILE_URL, {
          headers: { Authorization: `Bearer ${access_token}` },
        }),
        axios.get(LINKEDIN_API.USER_INFO_URL, {
          headers: { Authorization: `Bearer ${access_token}` },
        }),
      ]);

      console.log('Profile data received');

      const userProfile = {
        fullName: userInfoResponse.data.name,
        headline: profileResponse.data.headline.localized.en_US,
        image: userInfoResponse.data.picture,
        email: userInfoResponse.data.email,
        linkedinURL: profileResponse.data.vanityName
          ? `https://www.linkedin.com/in/${profileResponse.data.vanityName}`
          : null,
      };

      console.log('User profile created:', { ...userProfile, email: '***' });

      let existingUser = await User.findOne({ email: userProfile.email });

      if (existingUser) {
        console.log('Updating existing user');
        existingUser.set(userProfile);
        await existingUser.save();
      } else {
        console.log('Creating new user');
        existingUser = new User(userProfile);
        await existingUser.save();
      }

      // Create CV if needed
      let cvExists = await CV.exists({ user: existingUser._id });
      if (!cvExists) {
        console.log('Creating new CV');
        const newCV = new CV({
          user: existingUser._id,
          headline: userProfile.headline,
        });
        await newCV.save();
      }

      // Store user in session and wait for save
      req.session.user = existingUser;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            reject(err);
          }
          resolve();
        });
      });

      console.log('Session saved successfully');

      const redirectUrl = `${config.FRONTEND_URL}/profile/${existingUser._id}`;
      console.log('Redirecting to:', redirectUrl);

      res.redirect(redirectUrl);
    } catch (error) {
      console.error('LinkedIn OAuth Error:', error);
      console.error('Error details:', error.response?.data);
      res.status(500).json({
        error: 'Authentication failed',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      });
    }
  },
};

export default linkedinAuthService;
