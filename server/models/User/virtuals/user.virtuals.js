export const userVirtuals = {
  fullName: {
    get() {
      return `${this.firstName} ${this.lastName}`;
    },
  },
};
