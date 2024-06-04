import axios from 'axios';
import config from '../config/config.js';
import User from '../models/User.js';
import CV from '../models/CV.js';

const linkedinAuthUrl = 'https://www.linkedin.com/oauth/v2/authorization';
const linkedinTokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
const linkedinProfileUrl = 'https://api.linkedin.com/v2/me';
const linkedinUserInfoUrl = 'https://api.linkedin.com/v2/userinfo';

const linkedinAuthService = {
  initiateAuth: (_, res) => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: config.LINKEDIN_CLIENT_ID,
      redirect_uri: config.LINKEDIN_CALLBACK_URL,
      state: config.SESSION_STATE,
      scope: 'openid profile email r_basicprofile',
    });

    res.redirect(`${linkedinAuthUrl}?${params.toString()}`);
  },

  handleAuthCallback: async (req, res) => {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send('Authorization code missing');
    }

    try {
      const tokenResponse = await axios.post(linkedinTokenUrl, null, {
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

      const profileResponse = await axios.get(linkedinProfileUrl, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      const userInfoResponse = await axios.get(linkedinUserInfoUrl, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      // Get user data
      const userProfile = {
        fullName: userInfoResponse.data.name,
        headline: profileResponse.data.headline.localized.en_US,
        image: userInfoResponse.data.picture,
        email: userInfoResponse.data ? userInfoResponse.data.email : null,
        linkedinURL: `https://www.linkedin.com/in/${profileResponse.data.vanityName}`,
      };

      // Find existing user by email
      let existingUser = await User.findOne({ email: userProfile.email });

      if (existingUser) {
        // Update existing user profile
        existingUser.set(userProfile);
        await existingUser.save();
      } else {
        // Create a new user
        existingUser = new User(userProfile);
        await existingUser.save();
      }

      // Check if a CV exists for the user
      let cvExists = await CV.exists({ user: existingUser._id });

      if (!cvExists) {
        // Create a new CV for the user
        const newCV = new CV({
          user: existingUser._id,
          headline: userProfile.headline,
        });
        await newCV.save();
      }
      req.session.user = existingUser;

      

      if (res && userProfile) {
        const redirectUrl = `${process.env.FRONTEND_URL}/profile/${existingUser._id}`;
        res.redirect(redirectUrl);
        return;
      }
    } catch (error) {
      console.error('Error during LinkedIn OAuth:', error);
      res.status(500).send('Authentication failed');
    }
  },
};

export default linkedinAuthService;
