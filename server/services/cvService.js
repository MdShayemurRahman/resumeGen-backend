import mongoose from 'mongoose';
// import CV from '../models/CV.js';

export const findCvByUserId = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  const userCV = await CV.findOne({ user: userId }).populate('user');
  return userCV;
};

export const updateCv = async (userId, cvData) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  const existingCV = await CV.findOne({ user: userId });
  if (!existingCV) {
    throw new Error('CV not found');
  }

  Object.assign(existingCV, cvData);
  const updatedCV = await existingCV.save();
  return updatedCV;
};

