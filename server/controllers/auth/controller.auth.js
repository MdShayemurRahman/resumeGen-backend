import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import User from '../../models/User/user.model.js';
import { createError } from '../../utils/error.util.js';
import {
  sendResetPasswordEmail,
  sendVerificationEmail,
} from '../../utils/email.util.js';
import BlacklistedToken from '../../models/BlacklistedToken/blacklistedToken.model.js';

const JWT_SECRET = process.env.JWT_SECRET;

const formatUserResponse = (user) => ({
  id: user._id,
  email: user.email,
  name: user.name,
  isEmailVerified: user.isEmailVerified,
  profile: user.profile,
  jobTitle: user.jobTitle,
  authType: user.authType,
});

const safeUpdateUser = async (userId, updateData) => {
  // First get the current user data
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    throw new Error('User not found');
  }

  // Create a new update object that explicitly preserves the name
  const safeUpdate = {
    ...updateData,
    name: updateData.name || currentUser.name, // Explicitly preserve name
  };

  // Use findByIdAndUpdate with proper options
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: safeUpdate }, // Use $set to ensure partial updates work correctly
    {
      new: true,
      runValidators: true,
      context: 'query',
    }
  );

  // Verify the update
  if (!updatedUser.name) {
    console.error('Name missing after update, restoring...');
    updatedUser.name = currentUser.name;
    await updatedUser.save({ validateBeforeSave: false });
  }

  return updatedUser;
};

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      authType: 'local',
      iat: Math.floor(Date.now() / 1000), // Issued at time
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // Expires in 1 hour
    },
    JWT_SECRET
  );
};

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createError(400, 'Email already registered');
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const hashedVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      authType: 'local',
      verificationToken: hashedVerificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      profile: {
        bio: '',
      },
    });

    await sendVerificationEmail(user.email, verificationToken);

    const token = createToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      status: 'success',
      message:
        'Registration successful. Please check your email to verify your account.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isEmailVerified: user.isEmailVerified,
          // For testing only:
          verificationToken: verificationToken,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    console.log('Login attempt:', {
      email,
      userFound: !!user,
      timestamp: new Date(),
    });

    if (!user) {
      throw createError(401, 'Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('Password verification:', {
      isValid: isPasswordValid,
      timestamp: new Date(),
    });

    if (!isPasswordValid) {
      throw createError(401, 'Invalid email or password');
    }

    // Check email verification for local auth
    if (!user.isEmailVerified && user.authType === 'local') {
      throw createError(
        403,
        'Please verify your email address before logging in.'
      );
    }

    // Update last login time
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          lastLogin: new Date(),
          name: user.name, // Explicitly preserve the name
        },
      },
      { new: true }
    );

    // Create token
    const token = createToken(updatedUser);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    console.log('Login successful:', {
      userId: updatedUser._id,
      email: updatedUser.email,
      timestamp: new Date(),
    });

    res.json({
      status: 'success',
      data: {
        user: formatUserResponse(updatedUser),
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    // User should be verified by middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      throw createError(401, 'User not found');
    }

    res.json({
      status: 'success',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isEmailVerified: user.isEmailVerified,
          profile: user.profile,
          jobTitle: user.jobTitle,
          authType: user.authType,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.token;
    await BlacklistedToken.create({ token: req.token });
    res.clearCookie('token');

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, ...profileData } = req.body;

    const updateData = {
      name,
      profile: {
        ...profileData,
      },
    };

    const updatedUser = await safeUpdateUser(req.user.id, updateData);

    res.json({
      status: 'success',
      data: { user: formatUserResponse(updatedUser) },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Find user with password field included
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      throw createError(404, 'User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw createError(401, 'Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          password: hashedNewPassword,
          name: user.name,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Password change error:', error);
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        status: 'success',
        message:
          'If an account exists, you will receive a password reset email',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    await sendResetPasswordEmail(user.email, resetToken);

    res.json({
      status: 'success',
      message: 'If an account exists, you will receive a password reset email',
      token: resetToken,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw createError(400, 'Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const updateData = {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    };

    await safeUpdateUser(user._id, updateData);

    res.json({
      status: 'success',
      message:
        'Password reset successful. You can now login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = createToken(req.user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      status: 'success',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      status: 'success',
      data: {
        isAuthenticated: true,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          isEmailVerified: user.isEmailVerified,
          profile: user.profile,
        },
      },
    });
  } catch (error) {
    res.json({
      status: 'fail',
      data: { isAuthenticated: false },
    });
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw createError(400, 'Invalid or expired verification token');
    }

    const updateData = {
      isEmailVerified: true,
      verificationToken: undefined,
      verificationTokenExpires: undefined,
    };

    await safeUpdateUser(user._id, updateData);

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        status: 'success',
        message:
          'If an account exists with this email, a verification link will be sent.',
      });
    }

    if (user.isEmailVerified) {
      throw createError(400, 'Email is already verified');
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashedVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');

    user.verificationToken = hashedVerificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      status: 'success',
      message:
        'If an account exists with this email, a verification link will be sent.',
    });
  } catch (error) {
    next(error);
  }
};
