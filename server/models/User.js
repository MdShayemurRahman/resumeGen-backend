import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    fullName: String,
    image: String,
    email: String,
    linkedinURL: String,
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.model('User', UserSchema);

export default User;
