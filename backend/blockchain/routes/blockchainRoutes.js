const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');

/**
 * Sets up routes for blockchain operations such as querying the current state
 * of the blockchain, adding transactions, mining blocks, and validating the blockchain integrity.
 */

/**
 * Route to get the entire blockchain.
 */
router.get('/chain', async (req, res) => {
  try {
    await blockchainController.getBlockchain(req, res);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve the blockchain: " + error.message });
  }
});

/**
 * Route to create and add a new transaction to the blockchain.
 */
router.post('/transactions', async (req, res) => {
  try {
    await blockchainController.createTransaction(req, res);
  } catch (error) {
    res.status(500).json({ message: "Failed to add transaction: " + error.message });
  }
});

/**
 * Route to mine pending transactions and reward the miner.
 */
router.post('/mine', async (req, res) => {
  try {
    await blockchainController.minePendingTransactions(req, res);
  } catch (error) {
    res.status(500).json({ message: "Failed to mine transactions: " + error.message });
  }
});

/**
 * Route to validate the entire blockchain's integrity.
 */
router.get('/validate', async (req, res) => {
  try {
    await blockchainController.validateChain(req, res);
  } catch (error) {
    res.status(500).json({ message: "Failed to validate the blockchain: " + error.message });
  }
});

/**
 * Route to retrieve the balance of a given blockchain address.
 */
router.get('/balance/:address', async (req, res) => {
  try {
    await blockchainController.getBalanceOfAddress(req, res);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve balance: " + error.message });
  }
});

module.exports = router;
