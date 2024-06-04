import mongoose from 'mongoose';

const EducationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  startYear: String,
  endYear: String,
  grade: String,
});

export default EducationSchema;