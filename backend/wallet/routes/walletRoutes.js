const express = require('express');
const router = express.Router();
const WalletController = require('../controllers/walletController');

/**
 * POST /wallet/create
 * Route to create a new wallet. Returns the wallet's public and private keys.
 */
router.post('/create', (req, res) => {
  WalletController.createWallet(req, res);
});

/**
 * POST /wallet/transaction
 * Route to perform a transaction from a wallet. Requires fromAddress, toAddress, amount, and privateKey.
 */
router.post('/transaction', (req, res) => {
  const { fromAddress, toAddress, amount, privateKey } = req.body;
  if (!fromAddress || !toAddress || !amount || !privateKey) {
    return res.status(400).json({
      success: false,
      message: "All transaction fields (fromAddress, toAddress, amount, privateKey) must be provided."
    });
  }

  try {
    WalletController.createTransaction(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error processing transaction: ${error.message}`
    });
  }
});

/**
 * GET /wallet/balance/:address
 * Route to get the balance of a specific wallet using its address.
 */
router.get('/balance/:address', (req, res) => {
  const { address } = req.params;
  if (!address) {
    return res.status(400).json({
      success: false,
      message: "Wallet address is required."
    });
  }

  try {
    WalletController.getBalance(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error retrieving wallet balance: ${error.message}`
    });
  }
});

module.exports = router;
