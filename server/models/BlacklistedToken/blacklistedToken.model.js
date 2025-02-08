import mongoose from 'mongoose';

const blacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
  },
});

const BlacklistedToken = mongoose.model(
  'BlacklistedToken',
  blacklistedTokenSchema
);

export default BlacklistedToken;
