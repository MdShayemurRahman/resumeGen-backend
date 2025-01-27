// server/config/config.js
import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT || 5000,
  DB_URL: process.env.DB_URL,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-secret-key',
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
  LINKEDIN_CALLBACK_URL: process.env.LINKEDIN_CALLBACK_URL,
};

export default config;
