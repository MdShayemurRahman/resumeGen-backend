import bcrypt from 'bcryptjs';

export const preSaveMiddleware = {
  hashPassword: async function (next) {
    if (!this.isModified('password')) return next();

    try {
      this.password = await bcrypt.hash(this.password, 12);
      next();
    } catch (error) {
      next(error);
    }
  },

  updateTimestamp: function (next) {
    this.updatedAt = new Date();
    next();
  },
};
