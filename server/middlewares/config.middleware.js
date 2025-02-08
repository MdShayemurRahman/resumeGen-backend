import cors from 'cors';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';

const configureMiddleware = (app) => {
  if (!process.env.DB_URL) {
    throw new Error('DB_URL is not defined in environment variables');
  }

  const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    optionsSuccessStatus: 200,
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
      store: MongoStore.create({
        mongoUrl: process.env.DB_URL,
        ttl: 24 * 60 * 60,
        autoRemove: 'native',
        touchAfter: 24 * 3600,
      }),
      cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      },
      name: 'sessionId',
    })
  );
};

export default configureMiddleware;
