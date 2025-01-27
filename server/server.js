import mongoose from 'mongoose';

import app from './app.js';

const port = process.env.PORT || 5000;

const mongoURL = process.env.DB_URL;

mongoose
  .connect(mongoURL)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
});

app.listen(port, () => {
  console.log(`👀 Server is running on http://localhost:${port}`);
});
