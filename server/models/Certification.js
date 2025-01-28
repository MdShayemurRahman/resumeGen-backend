import mongoose from 'mongoose';

const CertificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Certification name is required'],
    trim: true,
  },
  issuer: {
    type: String,
    required: [true, 'Issuer is required'],
    trim: true,
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    trim: true,
  },
});

export default CertificationSchema;
