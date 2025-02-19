import mongoose from 'mongoose';
import 'dotenv/config';
import events from 'events';
import app from './app.js';

events.EventEmitter.defaultMaxListeners = 15;
const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.DB_URL)
  .then(async () => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

app.listen(port, () => {
  console.log(`👀 Server is running on http://localhost:${port}`);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});
