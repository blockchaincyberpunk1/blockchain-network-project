/**
 * @file walletRoutes.js
 * Routes for wallet operations in a blockchain application.
 * Handles creation, balance checking, transactions, and transaction history of wallets.
 */

const express = require("express");
const {
  authenticateToken,
  rateLimiter,
} = require("../middleware/authMiddleware");
const walletController = require("../controllers/walletController");

// Initialize express router
const router = express.Router();

// Apply rate limiting to all wallet operations as a security measure
router.use(rateLimiter);

/**
 * @api {post} /wallet/create
 * @apiName CreateWallet
 * @apiGroup Wallet
 * @apiPermission authenticated users
 *
 * @apiDescription Creates a new wallet for the user. Requires authentication.
 *
 * @apiUse TokenHeader
 *
 * @apiSuccess {String} walletAddress The address of the newly created wallet.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "walletAddress": "0x..."
 *     }
 */
router.post("/create", authenticateToken, walletController.createWallet);

/**
 * @api {get} /wallet/balance/:walletAddress
 * @apiName GetWalletBalance
 * @apiGroup Wallet
 * @apiPermission authenticated users
 *
 * @apiDescription Retrieves the balance of a specified wallet. Requires authentication.
 *
 * @apiParam {String} walletAddress The address of the wallet to retrieve the balance for.
 *
 * @apiUse TokenHeader
 *
 * @apiSuccess {Number} balance The current balance of the wallet.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "balance": 100
 *     }
 */
router.get(
  "/balance/:walletAddress",
  authenticateToken,
  walletController.getBalance
);

/**
 * @api {post} /wallet/transaction
 * @apiName CreateTransaction
 * @apiGroup Wallet
 * @apiPermission authenticated users
 *
 * @apiDescription Initiates a new transaction from the user's wallet. Requires authentication.
 *
 * @apiUse TokenHeader
 *
 * @apiParam {String} recipient The address of the transaction recipient.
 * @apiParam {Number} amount The amount of currency to send.
 *
 * @apiSuccess {String} transactionId The ID of the created transaction.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "transactionId": "tx_123456"
 *     }
 */
router.post(
  "/transaction",
  authenticateToken,
  walletController.createTransaction
);

/**
 * @api {get} /wallet/history/:walletAddress
 * @apiName GetTransactionHistory
 * @apiGroup Wallet
 * @apiPermission authenticated users
 *
 * @apiDescription Retrieves the transaction history of a specified wallet. Requires authentication.
 *
 * @apiParam {String} walletAddress The address of the wallet to retrieve the history for.
 *
 * @apiUse TokenHeader
 *
 * @apiSuccess {Object[]} transactions The list of transactions associated with the wallet.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "transactions": [...]
 *     }
 */
router.get(
  "/history/:walletAddress",
  authenticateToken,
  walletController.getTransactionHistory
);

module.exports = router;
