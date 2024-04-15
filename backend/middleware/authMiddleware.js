/**
 * @file authMiddleware.js
 * Provides middleware functions for rate limiting in a blockchain application.
 * This file uses express-rate-limit to set up an in-memory rate-limiting to prevent abuse.
 */

const { rateLimit } = require("express-rate-limit");

/**
 * General rate limiting middleware to prevent API abuse. Configurable to adjust
 * the maximum number of requests allowed per window for each IP address.
 *
 * @param {number} [maxRequests=100] - Maximum number of requests allowed per windowMs for each IP.
 * @param {number} [windowMs=900000] - Duration of the rate limiting window in milliseconds (default 15 minutes).
 * @returns {Function} Express middleware enforcing rate limits.
 */
exports.generalRateLimiter = (maxRequests = 100, windowMs = 900000) => rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true, // Send rate limit info in the RateLimit headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "Too many requests, please try again later."
        });
    }
});

/**
 * Specialized rate limiter for faucet requests to prevent abuse by limiting the
 * frequency of requests a user can make to the faucet endpoint.
 *
 * @returns {Function} Express middleware enforcing rate limits for faucet requests.
 */
exports.faucetRateLimiter = () => rateLimit({
    windowMs: 86400000, // 24 hours
    max: 1, // Each IP can only request once per day
    message: {
        success: false,
        message: "You can only request faucet funds once every 24 hours."
    },
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            message: "You can only request faucet funds once every 24 hours."
        });
    }
});

/**
 * Middleware to handle rate limit exceeded errors. This function intercepts rate limit errors
 * and formats a consistent response across the application.
 *
 * @param {Error} err - The error object, if any.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {Function} next - Callback to the next middleware function.
 */
exports.rateLimitErrorHandler = (err, req, res, next) => {
    if (err && err.statusCode === 429) {
        return res.status(429).json({
            success: false,
            message: "Rate limit exceeded. Please try again later."
        });
    }
    next(err);
};
