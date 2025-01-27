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
    const state = Math.random().toString(36).substring(7);

    req.session.linkedinState = state;

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.LINKEDIN_CLIENT_ID,
      redirect_uri: config.LINKEDIN_CALLBACK_URL,
      state: state,
      scope: 'openid profile email r_basicprofile',
    });

    res.redirect(`${LINKEDIN_API.AUTH_URL}?${params.toString()}`);
  },

  handleAuthCallback: async (req, res) => {
    const { code, state } = req.query;

    if (!state || state !== req.session.linkedinState) {
      console.error('State mismatch or missing');
      console.error('Received state:', state);
      console.error('Session state:', req.session.linkedinState);
      return res.status(400).send('Invalid state parameter');
    }

    if (!code) {
      return res.status(400).send('Authorization code missing');
    }

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

      const { access_token } = tokenResponse.data;

      const [profileResponse, userInfoResponse] = await Promise.all([
        axios.get(LINKEDIN_API.PROFILE_URL, {
          headers: { Authorization: `Bearer ${access_token}` },
        }),
        axios.get(LINKEDIN_API.USER_INFO_URL, {
          headers: { Authorization: `Bearer ${access_token}` },
        }),
      ]);

      const userProfile = {
        fullName: userInfoResponse.data.name,
        headline: profileResponse.data.headline?.localized?.en_US,
        image: userInfoResponse.data.picture,
        email: userInfoResponse.data.email,
        linkedinURL: profileResponse.data.vanityName
          ? `https://www.linkedin.com/in/${profileResponse.data.vanityName}`
          : null,
      };

      let existingUser = await User.findOne({ email: userProfile.email });

      if (existingUser) {
        existingUser.set(userProfile);
        await existingUser.save();
      } else {
        existingUser = new User(userProfile);
        await existingUser.save();
      }

      let cvExists = await CV.exists({ user: existingUser._id });
      if (!cvExists) {
        const newCV = new CV({
          user: existingUser._id,
          headline: userProfile.headline,
        });
        await newCV.save();
      }

      // Store user in session
      req.session.user = existingUser;

      // Clear the linkedinState from session as it's no longer needed
      delete req.session.linkedinState;

      const redirectUrl = `${config.FRONTEND_URL}/profile/${existingUser._id}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('LinkedIn OAuth Error:', error.response?.data || error);
      res.status(500).send('Authentication failed');
    }
  },
};

export default linkedinAuthService;
