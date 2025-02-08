import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import configureMiddleware from './middlewares/config.middleware.js';
import linkedinRouter from './routes/router.linkedin.js';
import resumeRouter from './routes/router.resume.js';
import { errorHandler } from './middlewares/error.middleware.js';
import userRouter from './routes/router.auth.js';
import { testEmailConfig } from './config/email.config.js';
import { monitorUserUpdates } from './utils/userVerification.js';


const app = express();

app.use(helmet());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

app.use(limiter);

configureMiddleware(app);

app.get('/health', (_, res) => {
  res.status(200).json({ status: 'healthy' });
});
app.use('/auth/linkedin', linkedinRouter);
app.use('/auth', userRouter);
app.use('/resumes', resumeRouter);

testEmailConfig().then((isConfigured) => {
  if (isConfigured) {
    console.log('Email service ready');
  } else {
    console.error('Email service not configured properly');
  }
});

app.use(monitorUserUpdates);
app.use(errorHandler);
app.use((_, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found',
  });
});

export default app;
