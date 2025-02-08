// models/User/user.model.js
import mongoose from 'mongoose';
import {
  basicInfoSchema,
  authSchema,
  accountStatusSchema,
  securitySchema,
  profileSchema,
  professionalInfoSchema,
} from './schemas/user.schema.js';
import {
  preSaveMiddleware,
  postSaveMiddleware,
} from './middleware/user.middleware.js';

const userSchema = new mongoose.Schema(
  {
    ...basicInfoSchema,
    ...authSchema,
    ...accountStatusSchema,
    ...securitySchema,
    ...profileSchema,
    ...professionalInfoSchema,

    resumes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
      },
    ],

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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre('save', preSaveMiddleware.savePreviousValues);
userSchema.pre('save', preSaveMiddleware.validateFields);
userSchema.pre('save', preSaveMiddleware.validateName);
userSchema.pre('save', preSaveMiddleware.hashPassword);
userSchema.pre('save', preSaveMiddleware.updateTimestamp);

userSchema.post('save', postSaveMiddleware.logSavedData);
userSchema.post('save', postSaveMiddleware.verifyData);

userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();

  // If there's a $set operation
  if (update.$set) {
    // Log the update operation
    console.log('Update Operation:', {
      query: this.getQuery(),
      update: update.$set,
    });

    // If name is not in the update, preserve it
    if (!update.$set.name) {
      const doc = await this.model.findOne(this.getQuery());
      if (doc && doc.name) {
        update.$set.name = doc.name;
        console.log('Preserved name in update:', doc.name);
      }
    }
  }

  next();
});

userSchema.post('findOneAndUpdate', async function (doc) {
  if (doc && !doc.name) {
    console.error('Name missing after update, attempting recovery...');
    const originalDoc = await this.model.findOne({ _id: doc._id });
    if (originalDoc && originalDoc.name) {
      doc.name = originalDoc.name;
      await doc.save({ validateBeforeSave: false });
      console.log('Name recovered:', doc.name);
    }
  }
});

// Strengthen the validation middleware
userSchema.pre('save', function (next) {
  if (!this.name && this.isModified('name')) {
    console.error('Attempted to save user without name');
    return next(new Error('Name cannot be empty'));
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
