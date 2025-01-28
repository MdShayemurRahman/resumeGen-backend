import mongoose from 'mongoose';

const LanguageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Language name is required'],
    trim: true,
  },
  level: {
    type: String,
    required: [true, 'Language level is required'],
    trim: true,
    enum: ['Native', 'Advanced', 'Intermediate', 'Basic', 'Learning'],
  },
});

export default LanguageSchema;