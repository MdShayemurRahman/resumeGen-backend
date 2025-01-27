import cors from 'cors';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import config from '../config/config.js';

const configureMiddleware = (app) => {
  // CORS configuration with credentials
  const corsOptions = {
    origin: config.FRONTEND_URL.split(',').map((url) => url.trim()),
    credentials: true,
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Session configuration
  app.use(
    session({
      secret: config.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: config.DB_URL,
        ttl: 24 * 60 * 60, // 24 hours
        autoRemove: 'native',
        touchAfter: 24 * 3600, // time period in seconds
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain:
          process.env.NODE_ENV === 'production' ? '.onrender.com' : undefined,
      },
      name: 'sessionId',
    })
  );

  // Debug middleware to log session data
  app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    console.log('Session Data:', req.session);
    next();
  });
};

export default configureMiddleware;
