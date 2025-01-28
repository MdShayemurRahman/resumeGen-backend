import mongoose from 'mongoose';

const EducationSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: [true, 'Institution name is required'],
    trim: true,
  },
  degree: {
    type: String,
    required: [true, 'Degree is required'],
    trim: true,
  },
  startYear: {
    type: String,
    required: [true, 'Start year is required'],
    trim: true,
  },
  endYear: {
    type: String,
    trim: true,
  },
  grade: {
    type: String,
    trim: true,
  },
});

export default EducationSchema;
