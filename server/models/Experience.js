import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  startDate: {
    type: String,
    required: [true, 'Start date is required'],
    trim: true,
  },
  endDate: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
  },
});

export default ExperienceSchema;
