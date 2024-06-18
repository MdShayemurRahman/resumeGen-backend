import dotenv from 'dotenv';

dotenv.config();

const config = {
  PORT: process.env.PORT || 5000,
  SESSION_SECRET: process.env.SESSION_SECRET,
  SESSION_STATE: process.env.SESSION_STATE,
  DB_URL: process.env.DB_URL,
  LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
  LINKEDIN_CALLBACK_URL: process.env.LINKEDIN_CALLBACK_URL,
  // FRONTEND_URL: process.env.FRONTEND_URL,
  FRONTEND_URL: "https://link2resume.netlify.app",
};

export default config;
