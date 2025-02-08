import mongoose from 'mongoose';
import 'dotenv/config';

import app from './app.js';

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
