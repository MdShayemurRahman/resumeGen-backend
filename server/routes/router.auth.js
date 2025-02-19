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

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts, please try again later',
});

const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many email requests, please try again later',
});

userRouter.post(
  '/register',
  authLimiter,
  validateRequest('register'),
  register
);

userRouter.post('/login', authLimiter, validateRequest('login'), login);

userRouter.post(
  '/forgot-password',
  emailLimiter,
  validateRequest('forgotPassword'),
  forgotPassword
);

userRouter.post(
  '/reset-password/:token',
  authLimiter,
  validateRequest('resetPassword'),
  resetPassword
);

userRouter.get(
  '/verify-email/:token',
  validateRequest('verifyEmail'),
  verifyEmail
);

userRouter.post(
  '/resend-verification',
  emailLimiter,
  validateRequest('forgotPassword'), // reusing email validation
  resendVerificationEmail
);

// Protected routes with validation
userRouter.use(verifyToken);
userRouter.get('/profile', getProfile);
userRouter.put('/profile', validateRequest('updateProfile'), updateProfile);
userRouter.post(
  '/change-password',
  validateRequest('changePassword'),
  changePassword
);
userRouter.post('/logout', logout);
userRouter.post('/refresh-token', refreshToken);
userRouter.get('/check-auth', checkAuth);

export default userRouter;
