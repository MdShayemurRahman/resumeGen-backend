// utils/errors.js
export class LinkedinAPIError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'LinkedinAPIError';
    this.status = 500;
    this.originalError = originalError;
  }
}

export class AuthenticationError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'AuthenticationError';
    this.status = 401;
    this.originalError = originalError;
  }
}
