const logger = require("../logger"); // Adjust this path to your logger's actual location

/**
 * Error handling middleware for Express applications. It captures runtime and operational errors,
 * logs them for debugging purposes, and formats a client-safe error message.
 * It distinguishes between operational errors (expected errors in the application flow) and
 * programming errors (unexpected errors), ensuring that the latter do not leak sensitive information.
 *
 * @param {Error} err - The error object caught by the middleware.
 * @param {Request} req - The Express request object, providing context about the request that led to the error.
 * @param {Response} res - The Express response object, used to send a response to the client.
 * @param {NextFunction} next - The next middleware function in the Express stack.
 */
const errorMiddleware = (err, req, res, next) => {
  // Log the error in detail for internal diagnostics
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

  // Operational errors are known errors that we have coded for in the application flow
  const isOperationalError = err.isOperational || false;

  const statusCode = err.statusCode || 500;
  const message = isOperationalError
    ? err.message
    : "An unexpected error occurred. Please try again later.";

  // For non-operational errors, you might not want to send the error stack to the client in production
  // This is for debugging unexpected errors during development
  const responsePayload = { error: message };
  if (!isOperationalError && process.env.NODE_ENV === "development") {
    responsePayload.stack = err.stack;
  }

  // Send a generic error message for non-operational errors to avoid leaking any sensitive information
  res.status(statusCode).send(responsePayload);
};

/**
 * A factory function for creating error objects that are marked as operational.
 * This is useful for creating errors that are expected within the application's operation,
 * such as validation errors, not found errors, etc., which do not indicate a bug in the system.
 *
 * @param {string} message - The error message.
 * @param {number} statusCode - The HTTP status code appropriate for this error.
 * @returns {Error} - The customized error object.
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
