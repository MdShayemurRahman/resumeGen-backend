import cors from 'cors';
import express from 'express';
import session from 'express-session';
import MongoDBStore from 'connect-mongodb-session';

import config from '../config/config.js';

const configureMiddleware = (app) => {
  app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const store = MongoDBStore(session)({
    uri: config.MONGODB_URI,
    collection: 'sessions',
  });

  app.use(
    session({
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: store,
      cookie: {
        maxAge: 5 * 60 * 1000, // 5 minutes
        secure: false, // Set to true in production
        httpOnly: true,
        sameSite: 'lax', // Adjust as needed
      },
    })
  );
};

export default configureMiddleware;
