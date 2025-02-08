import { createError } from '../utils/error.util.js';

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
};

const validatePassword = (password) => {
  return password.length >= 8;
};

export const validateRequest = (type) => {
  return (req, res, next) => {
    try {
      switch (type) {
        case 'register':
          const { email, password, name } = req.body;

          if (!email || !password || !name) {
            throw createError(400, 'Please provide all required fields');
          }
          if (!validateEmail(email)) {
            throw createError(400, 'Please provide a valid email');
          }
          if (!validatePassword(password)) {
            throw createError(
              400,
              'Password must be at least 8 characters long'
            );
          }
          break;

        case 'login':
          if (!req.body.email || !req.body.password) {
            throw createError(400, 'Please provide email and password');
          }
          if (!validateEmail(req.body.email)) {
            throw createError(400, 'Please provide a valid email');
          }
          break;

        case 'email':
          if (!req.body.email || !validateEmail(req.body.email)) {
            throw createError(400, 'Please provide a valid email');
          }
          break;

        case 'resetPassword':
          if (!req.body.password || !validatePassword(req.body.password)) {
            throw createError(
              400,
              'Password must be at least 8 characters long'
            );
          }
          break;

        case 'changePassword':
          if (!req.body.currentPassword || !req.body.newPassword) {
            throw createError(400, 'Please provide current and new password');
          }
          if (!validatePassword(req.body.newPassword)) {
            throw createError(
              400,
              'New password must be at least 8 characters long'
            );
          }
          break;

        case 'updateProfile':
          if (!req.body.name) {
            throw createError(400, 'Name is required');
          }
          if (req.body.email && !validateEmail(req.body.email)) {
            throw createError(400, 'Please provide a valid email');
          }
          break;

        default:
          break;
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
