/**
 * @file blockchainRoutes.js
 * @description Defines REST API routes for blockchain operations, integrating authentication and rate limiting to secure the network and ensure equitable resource use.
 */

const express = require("express");
const router = express.Router();
const blockchainController = require("../controllers/blockchainController");
const { authenticateToken } = require("../middleware/authMiddleware");
const { rateLimiter } = require("../middleware/rateLimiter");

// Middleware to apply rate limiting to all blockchain-related routes as a basic protection measure against DDoS and other abuse.
router.use(rateLimiter);

/**
 * Route to post a new transaction to the blockchain.
 * Utilizes authentication middleware to ensure that the requester is authorized.
 */
router.post(
  "/transactions/new",
  authenticateToken,
  blockchainController.createTransaction
);

/**
 * Route to mine a new block on the blockchain.
 * Protected by authentication to prevent unauthorized mining and ensure network security.
 */
router.get("/mine", authenticateToken, blockchainController.mineBlock);

/**
 * Route to retrieve the full blockchain.
 * This route is open access to allow for public verification of blockchain data, ensuring transparency.
 */
router.get("/chain", blockchainController.getChain);

/**
 * Route to fetch the last block in the blockchain.
 * Open access, as this information is critical for various operations, such as mining, and does not compromise security.
 */
router.get("/lastBlock", blockchainController.getLastBlock);

// Additional routes can be defined here as needed for your application, such as for querying transaction histories, balances, etc.

module.exports = router;
