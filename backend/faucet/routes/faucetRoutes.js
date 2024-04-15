const express = require('express');
const router = express.Router();
const FaucetController = require('../controllers/faucetController');
const { faucetRateLimiter } = require('../../middleware/authMiddleware');

/**
 * POST /faucet/request-tokens
 * Route to request tokens from the faucet. This route uses a rate limiter to prevent abuse.
 * Requires recipientAddress and the amount of tokens requested.
 */
router.post('/request-tokens', faucetRateLimiter(), (req, res) => {
  FaucetController.sendTokens(req, res);
});

module.exports = router;
