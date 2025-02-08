// In auth.middleware.js

import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.util.js';
import User from '../models/User/user.model.js';
import BlacklistedToken from '../models/BlacklistedToken/blacklistedToken.model.js';

export const verifyToken = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.replace('Bearer ', '').trim();
    }

    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw createError(401, 'Please log in to access this resource');
    }

    const isBlacklisted = await BlacklistedToken.findOne({ token });
    if (isBlacklisted) {
      throw createError(401, 'Token has been invalidated. Please log in again');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime >= decoded.exp) {
        throw createError(401, 'Token has expired');
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        throw createError(401, 'User no longer exists');
      }

      req.user = decoded;
      req.token = token;
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw createError(401, 'Invalid token');
      } else if (error.name === 'TokenExpiredError') {
        throw createError(401, 'Token has expired');
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};
