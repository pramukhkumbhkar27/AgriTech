const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for development
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err);
  }

  // Mongoose bad ObjectId / CastError
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { statusCode: 404, message };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for field '${field}'. Please provide an alternative value.`;
    error = { statusCode: 400, message };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = { statusCode: 400, message };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = { statusCode: 401, message: 'Invalid authentication token' };
  }
  if (err.name === 'TokenExpiredError') {
    error = { statusCode: 401, message: 'Authentication token has expired' };
  }

  const statusCode = error.statusCode || err.statusCode || 500;
  const message = error.message || err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
