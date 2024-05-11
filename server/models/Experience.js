import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
  title: String,
  company: String,
  startDate: Date,
  endDate: Date,
  description: String,
});

export default ExperienceSchema;
