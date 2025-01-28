import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

import configureMiddleware from './middlewares/config.middleware.js';
import linkedinRouter from './routes/router.linkedin.js';
import cvRouter from './routes/router.cv.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(helmet());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

configureMiddleware(app);
// configureSecurityMiddleware(app);

app.get('/health', (_, res) => {
  res.status(200).json({ status: 'healthy' });
});

app.use('/auth', linkedinRouter);
app.use('/cv', cvRouter); 

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({
    status: 'fail',
    message: 'Route not found',
  });
});

export default app;
