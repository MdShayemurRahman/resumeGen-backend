// models/User/middleware/user.middleware.js
import bcrypt from 'bcryptjs';

export const preSaveMiddleware = {
  savePreviousValues: function (next) {
    console.log('Saving previous values');
    this._previousName = this.name;
    next();
  },

  validateFields: function (next) {
    console.log('Validating fields');
    if (!this.isNew && !this.name && this._previousName) {
      this.name = this._previousName;
      console.log('Restored previous name:', this._previousName);
    }
    next();
  },

  validateName: function (next) {
    console.log('Validating name:', this.name);
    if (!this.name && this.isModified('name')) {
      return next(new Error('Name cannot be empty'));
    }
    next();
  },

  hashPassword: async function (next) {
    console.log('Checking password modification');
    if (!this.isModified('password')) return next();
    try {
      this.password = await bcrypt.hash(this.password, 12);
      next();
    } catch (error) {
      next(error);
    }
  },

  updateTimestamp: function (next) {
    console.log('Updating timestamp');
    this.updatedAt = new Date();
    next();
  },
};

export const postSaveMiddleware = {
  logSavedData: function (doc) {
    console.log('Document saved:', {
      id: doc._id,
      name: doc.name,
      email: doc.email,
    });
  },

  verifyData: async function (doc) {
    console.log('Verifying saved data:', {
      id: doc._id,
      name: doc.name,
      previousName: doc._previousName,
      email: doc.email,
    });

    if (!doc.name && doc._previousName) {
      console.log('Restoring lost name in post-save');
      doc.name = doc._previousName;
      await doc.save({ validateBeforeSave: false });
    }
  },
};
