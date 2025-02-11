import express from 'express';
import rateLimit from 'express-rate-limit';

import { validateRequest } from '../middlewares/validation.middleware.js';
import { verifyToken } from '../middlewares/auth.middleware.js';
import {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  refreshToken,
  checkAuth,
  verifyEmail,
  resendVerificationEmail,
} from '../controllers/auth/controller.auth.js';

const userRouter = express.Router();

const logoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

// Public routes
userRouter.post('/register', validateRequest('register'), register);
userRouter.post('/login', validateRequest('login'), login);
userRouter.post('/forgot-password', validateRequest('email'), forgotPassword);
userRouter.post(
  '/reset-password/:token',
  validateRequest('resetPassword'),
  resetPassword
);
userRouter.get('/verify-email/:token', verifyEmail);
userRouter.post(
  '/resend-verification',
  validateRequest('email'),
  resendVerificationEmail
);

// Protected routes (require authentication)
userRouter.use(verifyToken);
userRouter.get('/profile', getProfile);
userRouter.put('/profile', validateRequest('updateProfile'), updateProfile);
userRouter.post(
  '/change-password',
  validateRequest('changePassword'),
  changePassword
);
userRouter.post('/logout', logoutLimiter, logout);
userRouter.post('/refresh-token', refreshToken);
userRouter.get('/check-auth', checkAuth);

export default userRouter;
