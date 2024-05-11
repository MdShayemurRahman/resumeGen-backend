// app.js

import express from 'express';
import configureMiddleware from './middlewares/configureMiddleware.js';
import linkedinRouter from './routes/linkedinRoutes.js';
import cvRouter from './routes/cvRoutes.js'; // Import CV routes

const app = express();

configureMiddleware(app);

// Use routes
app.use(linkedinRouter);
app.use(cvRouter); // Mount CV routes

export default app;
