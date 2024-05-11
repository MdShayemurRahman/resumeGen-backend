import mongoose from 'mongoose';

const EducationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  year: String,
  grade: String,
});

export default EducationSchema;