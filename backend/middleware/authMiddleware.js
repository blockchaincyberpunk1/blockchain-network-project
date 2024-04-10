/**
 * @file authMiddleware.js
 * Provides middleware functions for authentication and rate limiting in a blockchain application.
 * This includes JWT token verification for security and an in-memory rate-limiting setup to prevent abuse.
 */

const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User"); // Assuming you have a User model for database interaction

/**
 * Middleware to authenticate requests using JWT tokens.
 * Validates the token and ensures the user associated with the token is still valid and has not been deactivated.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Callback to the next middleware function.
 */
exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401); // Unauthorized if token is not provided
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden if token is invalid
    }

    // Verify if the user exists in the database and is active
    const foundUser = await User.findById(user.id);
    if (!foundUser || !foundUser.isActive) {
      return res.sendStatus(403); // Forbidden if user does not exist or is not active
    }

    req.user = foundUser; // Attach user to request object
    next(); // Proceed to next middleware or route handler
  });
};

/**
 * Applies a general rate-limiting middleware to prevent API abuse.
 * Configurable to adjust the maximum number of requests allowed per window per IP address.
 *
 * @param {number} maxRequests - Maximum number of requests per windowMs per IP.
 * @param {number} windowMs - Duration of the rate limiting window in milliseconds.
 * @returns {Function} - The rate-limiting middleware function.
 */
exports.rateLimiter = (maxRequests = 100, windowMs = 15 * 60 * 1000) =>
  rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: `Too many requests, please try again later.`,
  });

/**
 * A more stringent rate limiter specifically for faucet requests, to prevent abuse by limiting
 * the frequency of requests a user can make to the faucet endpoint.
 *
 * @returns {Function} - The rate-limiting middleware function tailored for faucet requests.
 */
exports.faucetRateLimiter = () =>
  rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 1, // Each IP can only request once per day
    message: "You can only request faucet funds once every 24 hours.",
    onLimitReached: (req, res) => {
      console.log(`Faucet limit reached for IP: ${req.ip}`);
    },
  });

/**
 * Checks if the user making the request has enough balance for transactions.
 * This is crucial for transaction-related operations where balance verification is necessary.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Callback to the next middleware function.
 */
exports.checkBalance = async (req, res, next) => {
  // Implementation depends on your blockchain and user model
  // Example:
  const { amount } = req.body;
  const userBalance = await blockchain.getUserBalance(req.user.address);

  if (amount > userBalance) {
    return res.status(400).json({ message: "Insufficient balance." });
  }

  next();
};
