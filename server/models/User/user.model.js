import mongoose from 'mongoose';
import {
  basicInfoSchema,
  authSchema,
  accountStatusSchema,
  securitySchema,
  profileSchema,
  professionalInfoSchema,
} from './schemas/user.schema.js';
import { instanceMethods, staticMethods } from './methods/user.methods.js';
import { preSaveMiddleware } from './middleware/user.middleware.js';
import { userVirtuals } from './virtuals/user.virtuals.js';

const userSchema = new mongoose.Schema(
  {
    ...basicInfoSchema,
    ...authSchema,
    ...accountStatusSchema,
    ...securitySchema,
    ...profileSchema,
    ...professionalInfoSchema,

    // Resume References
    resumes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
      },
    ],

    // System Fields
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ linkedinId: 1 }, { sparse: true });

// Add instance methods
Object.assign(userSchema.methods, instanceMethods);

// Add static methods
Object.assign(userSchema.statics, staticMethods);

// Add virtuals
Object.entries(userVirtuals).forEach(([name, virtual]) => {
  userSchema.virtual(name).get(virtual.get);
});

// Add middleware
userSchema.pre('save', preSaveMiddleware.hashPassword);
userSchema.pre('save', preSaveMiddleware.updateTimestamp);

const User = mongoose.model('User', userSchema);

export default User;
