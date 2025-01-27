import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import configureMiddleware from './middlewares/config.middleware.js';
import linkedinRouter from './routes/router.linkedin.js';
import cvRouter from './routes/router.cv.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { isAuthenticated } from './middlewares/auth.middleware.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Configure basic middleware
configureMiddleware(app);

// Health check route
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'healthy' });
});

// API routes
app.use('/auth', linkedinRouter);
app.use('/cv', cvRouter); 

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

export default app;
