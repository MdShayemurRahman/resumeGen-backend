// services/linkedin.service.js
import axios from 'axios';
import User from '../models/user.model.js';

const LINKEDIN_API = {
  AUTH_URL: 'https://www.linkedin.com/oauth/v2/authorization',
  TOKEN_URL: 'https://www.linkedin.com/oauth/v2/accessToken',
  PROFILE_URL: 'https://api.linkedin.com/v2/me',
  USER_INFO_URL: 'https://api.linkedin.com/v2/userinfo',
};

class LinkedInService {
  async refreshAccessToken(userId) {
    try {
      const user = await User.findById(userId);
      if (!user?.linkedinTokens?.refreshToken) {
        throw new Error('No refresh token available');
      }

      // Check if current token is still valid (with 5-minute buffer)
      const now = new Date();
      const tokenExpiryTime = new Date(user.linkedinTokens.issuedAt);
      tokenExpiryTime.setSeconds(
        tokenExpiryTime.getSeconds() + user.linkedinTokens.expiresIn - 300
      );

      if (now < tokenExpiryTime) {
        return user.linkedinTokens.accessToken;
      }

      // Request new access token
      const tokenResponse = await axios.post(LINKEDIN_API.TOKEN_URL, null, {
        params: {
          grant_type: 'refresh_token',
          refresh_token: user.linkedinTokens.refreshToken,
          client_id: process.env.LINKEDIN_CLIENT_ID,
          client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // Update user's tokens
      user.linkedinTokens = {
        accessToken: tokenResponse.data.access_token,
        refreshToken: tokenResponse.data.refresh_token,
        expiresIn: tokenResponse.data.expires_in,
        issuedAt: new Date(),
      };

      await user.save();
      return user.linkedinTokens.accessToken;
    } catch (error) {
      console.error('Error refreshing LinkedIn token:', error);
      throw error;
    }
  }

  async getProfileData(accessToken) {
    try {
      const [profileResponse, userInfoResponse] = await Promise.all([
        axios.get(LINKEDIN_API.PROFILE_URL, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
        axios.get(LINKEDIN_API.USER_INFO_URL, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      ]);

      return {
        name: userInfoResponse.data.name,
        email: userInfoResponse.data.email,
        linkedinId: profileResponse.data.id,
        jobTitle: profileResponse.data.headline?.localized?.en_US || '',
        profile: {
          bio: '',
          email: userInfoResponse.data.email,
          picture: userInfoResponse.data.picture,
        },
        linkedinURL: profileResponse.data.vanityName
          ? `https://www.linkedin.com/in/${profileResponse.data.vanityName}`
          : null,
      };
    } catch (error) {
      console.error('Error fetching LinkedIn profile:', error);
      throw error;
    }
  }
}

export default new LinkedInService();
