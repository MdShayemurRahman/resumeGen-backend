import bcrypt from 'bcryptjs';

export const instanceMethods = {
  comparePassword: async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  },

  updateLastLogin: async function () {
    this.lastLogin = new Date();
    return this.save();
  },
};

export const staticMethods = {
  findByEmail: function (email) {
    return this.findOne({ email: email.toLowerCase() });
  },

  findByLinkedInId: function (linkedinId) {
    return this.findOne({ linkedinId });
  },
};
