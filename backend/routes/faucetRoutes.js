const express = require("express");
const faucetController = require("../controllers/faucetController");
const { faucetRateLimiter } = require("../middleware/authMiddleware");

// Create a router instance for faucet-related routes.
const router = express.Router();

/**
 * @route POST /requestCoins
 * @description Allows users to request coins from the faucet by submitting their recipient address.
 * Incorporates a rate limiter to prevent abuse of the faucet functionality.
 * @access Public
 * @param {express.Request} req - The Express request object, which includes the recipient's address in the body.
 * @param {express.Response} res - The Express response object used to return the result.
 * @returns A response indicating whether the coin request was successful or not.
 */
router.post("/requestCoins", faucetRateLimiter, faucetController.requestCoins);

// More routes can be added here if the faucet functionality is expanded,
// such as checking the status of a request or retrieving the history of all faucet transactions.

module.exports = router;
