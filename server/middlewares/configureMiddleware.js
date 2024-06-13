import cors from 'cors';
import express from 'express';
import session from 'express-session';
// import MongoDBStore from 'connect-mongodb-session';

import config from '../config/config.js';

const configureMiddleware = (app) => {
  app.options('*', cors({ origin: config.FRONTEND_URL, credentials: true }));
  app.use(cors({ origin: config.FRONTEND_URL, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // const store = MongoDBStore(session)({
  //   uri: config.MONGODB_URI,
  //   collection: 'sessions',
  // });

  app.use(
    session({
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      // store: store,
      cookie: {
        maxAge: 60 * 60 * 1000,
        secure: true,
        // secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'None',
        // sameSite: 'Strict',
        __Secure__: true,
      },
    })
  );
};

export default configureMiddleware;
