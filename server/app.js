import express from 'express';

import configureMiddleware from './middlewares/configureMiddleware.js';
import linkedinRouter from './routes/linkedinRoutes.js';
import cvRouter from './routes/cvRoutes.js';

const app = express();

configureMiddleware(app);

app.get('/test', (_, res) => {
  res.json({ message: 'server works!' });
});

app.use('/auth', linkedinRouter);

// const isAuthenticated = (req, res, next) => {
//   if (req.session.user) {
//     res.status(200).json({ isAuthenticated: true });
//     next();
//   } else {
//     res.status(200).json({ isAuthenticated: false });
//   }
// };

app.use('/cv', cvRouter);

export default app;
