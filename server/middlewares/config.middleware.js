import cors from 'cors';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import config from '../config/config.js';

const configureMiddleware = (app) => {
  const corsOptions = {
    origin: config.FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: config.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: config.DB_URL,
        ttl: 60 * 60, // 1 hour
        crypto: {
          secret: config.SESSION_SECRET,
        },
        autoRemove: 'native',
      }),
      cookie: {
        maxAge: 60 * 60 * 1000, // 1 hour
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      },
      name: 'sessionId',
    })
  );
};

export default configureMiddleware;
