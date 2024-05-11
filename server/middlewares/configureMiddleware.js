import cors from 'cors';
import express from 'express';
import session from 'express-session';

import config from '../config/config.js';

const configureMiddleware = (app) => {
  app.use(cors({ origin: 'http://localhost:3000' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Set up express-session
  app.use(
    session({
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Set to true if using HTTPS
      },
    })
  );
};

export default configureMiddleware;
