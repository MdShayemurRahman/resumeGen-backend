import express from 'express';

import configureMiddleware from './middlewares/configureMiddleware.js';
import linkedinRouter from './routes/linkedinRoutes.js';
import cvRouter from './routes/cvRoutes.js';

const app = express();

configureMiddleware(app);

app.get('/test', (req, res) => {
  res.json({ message: 'server works!' });
});

app.use('/auth', linkedinRouter);
app.use('/cv', cvRouter);

export default app;
