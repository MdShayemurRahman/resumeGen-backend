import jwt from 'jsonwebtoken';
import { createError } from '../utils/error.util.js';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      throw createError(401, 'Please log in to access this resource');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(createError(401, 'Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(createError(401, 'Token expired'));
    } else {
      next(error);
    }
  }
};
