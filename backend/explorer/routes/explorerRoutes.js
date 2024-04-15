const express = require('express');
const router = express.Router();
const ExplorerController = require('../controllers/explorerController');

/**
 * GET /blocks
 * Fetches the latest blocks from the blockchain.
 */
router.get('/blocks', (req, res) => {
  ExplorerController.getBlockchain(req, res);
});

/**
 * GET /blocks/:index
 * Fetches a specific block by its index.
 */
router.get('/blocks/:index', (req, res) => {
  ExplorerController.getBlockByIndex(req, res);
});

/**
 * GET /transactions/:address
 * Fetches the transaction history for a specific blockchain address.
 */
router.get('/transactions/:address', (req, res) => {
  ExplorerController.getTransactionsForAddress(req, res);
});

/**
 * GET /balance/:address
 * Retrieves the balance of a specific blockchain address.
 */
router.get('/balance/:address', (req, res) => {
  ExplorerController.getAddressBalance(req, res);
});

module.exports = router;
