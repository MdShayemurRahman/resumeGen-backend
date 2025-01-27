export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    status: 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

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