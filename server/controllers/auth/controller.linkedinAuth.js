// controllers/auth/controller.linkedin.js
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../../models/user.model.js';
import { createError } from '../../utils/error.util.js';

const LINKEDIN_API = {
  AUTH_URL: 'https://www.linkedin.com/oauth/v2/authorization',
  TOKEN_URL: 'https://www.linkedin.com/oauth/v2/accessToken',
  PROFILE_URL: 'https://api.linkedin.com/v2/me',
  USER_INFO_URL: 'https://api.linkedin.com/v2/userinfo',
};

export const initiateAuth = async (req, res) => {
  try {
    const state = Math.random().toString(36).substring(7);
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
      client_id: process.env.LINKEDIN_CLIENT_ID,
      redirect_uri: process.env.LINKEDIN_CALLBACK_URL,
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
};

export const handleAuthCallback = async (req, res) => {
  const { code, state } = req.query;

  console.log('Callback received');
  console.log('Session:', req.session);
  console.log('Received state:', state);
  console.log('Session state:', req.session.linkedinState);

  if (!code) {
    console.error('No code received');
    return res.status(400).send('Authorization code missing');
  }

  try {
    console.log('Requesting access token...');
    const tokenResponse = await axios.post(LINKEDIN_API.TOKEN_URL, null, {
      params: {
        grant_type: 'authorization_code',
        code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: process.env.LINKEDIN_CALLBACK_URL,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const { access_token } = tokenResponse.data;
    console.log('Access token received');

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
      name: userInfoResponse.data.name,
      email: userInfoResponse.data.email,
      linkedinId: profileResponse.data.id,
      jobTitle:
        profileResponse.data.headline?.localized?.en_US ||
        profileResponse.data.headline ||
        userInfoResponse.data.headline ||
        '',
      linkedinURL: profileResponse.data.vanityName
        ? `https://www.linkedin.com/in/${profileResponse.data.vanityName}`
        : null,
      authType: 'linkedin',
      profile: {
        bio: '',
        email: userInfoResponse.data.email,
        picture: userInfoResponse.data.picture,
      },
    };

    // Find or create user
    let user = await User.findOne({ linkedinId: userProfile.linkedinId });

    if (!user) {
      // Check if email exists
      const existingUser = await User.findOne({ email: userProfile.email });

      if (existingUser) {
        const updatedUser = await updateLinkedInProfile(
          existingUser,
          userProfile
        );
        user = updatedUser;
      } else {
        user = await User.create({
          ...userProfile,
          isEmailVerified: true,
        });
      }
    } else {
      const updatedUser = await updateLinkedInProfile(user, userProfile);
      user = updatedUser;
    }

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        authType: 'linkedin',
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (error) {
    console.error('LinkedIn OAuth Error:', error);
    console.error('Error details:', error.response?.data);
    res.status(500).json({
      error: 'Authentication failed',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
    // res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
  }
};

export const handleLogout = async (_, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Error during logout' });
  }
};

export const checkLinkedInAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      isAuthenticated: true,
      isLinkedInConnected: !!user.linkedinId,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        profile: user.profile,
      },
    });
  } catch (error) {
    console.error('Auth check error:', error);
    res.status(500).json({ message: 'Error checking authentication status' });
  }
};

export const importLinkedInProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.linkedinId) {
      throw createError(400, 'No LinkedIn account linked');
    }

    // Get fresh access token
    const accessToken = await LinkedInService.refreshAccessToken(user._id);
    const profileData = await LinkedInService.getProfileData(accessToken);

    // Update user profile
    const updatedUser = await updateLinkedInProfile(user, profileData);

    res.status(200).json({
      message: 'Profile refreshed successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        jobTitle: updatedUser.jobTitle,
        profile: updatedUser.profile,
      },
    });
  } catch (error) {
    console.error('Profile import error:', error);
    if (error.response?.status === 401) {
      res.status(401).json({
        message: 'Please reconnect your LinkedIn account',
        needsReauth: true,
      });
    } else {
      res.status(error.statusCode || 500).json({
        message: error.message || 'Error importing profile',
      });
    }
  }
};

const updateLinkedInProfile = async (user, profileData) => {
  try {
    const updateData = {
      name: profileData.name,
      jobTitle: profileData.jobTitle || user.jobTitle,
      profile: {
        ...user.profile,
        ...profileData.profile,
      },
    };

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        context: 'query',
      }
    );

    return updatedUser;
  } catch (error) {
    throw error;
  }
};
