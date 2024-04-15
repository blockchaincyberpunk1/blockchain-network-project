const logger = require("../lib/logger");

/**
 * Middleware for handling exceptions and errors in an Express application. It logs errors,
 * determines the nature of the error (operational vs. programming), and sends appropriate
 * responses to the client to prevent sensitive information leakage.
 *
 * @param {Error} err - The error object caught by the middleware.
 * @param {Request} req - The Express request object, providing context about the request that led to the error.
 * @param {Response} res - The Express response object, used to send a response to the client.
 * @param {NextFunction} next - The next middleware function in the Express stack.
 */
const errorMiddleware = (err, req, res, next) => {
  // Detailed logging for internal diagnostics
  logger.error(`Error processing request ${req.method} ${req.path}`, {
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name,
    },
    request: {
      headers: req.headers,
      params: req.params,
      query: req.query,
      body: req.body,
    },
  });

  // Identify if the error is operational (expected) or programming (unexpected)
  const isOperationalError = err.isOperational || false;

  // Default to 500 server error unless specified
  const statusCode = err.statusCode || 500;
  // Use specific message if operational, generic message otherwise
  const message = isOperationalError
    ? err.message
    : "An unexpected error occurred. Please try again later.";

  // Debug information in development mode
  const responsePayload = { error: message };
  if (!isOperationalError && process.env.NODE_ENV === "development") {
    responsePayload.stack = err.stack;
  }

  // Send the appropriate error response
  res.status(statusCode).send(responsePayload);
};

/**
 * Factory function to create an operational error. These are typically known errors
 * within the application logic (e.g., validation errors, resource not found errors),
 * and they are not indicative of an underlying bug.
 *
 * @param {string} message - Descriptive error message.
 * @param {number} statusCode - HTTP status code appropriate for the error.
 * @returns {Error} - An error object flagged as operational with a specific status code.
 */
const createOperationalError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

module.exports = {
  errorMiddleware,
  createOperationalError,
};
