const express = require('express');
const router = express.Router();
const TransactionController = require('../controllers/transactionController');

/**
 * POST /transactions
 * Route for creating a new transaction. It expects a JSON body with fromAddress, toAddress, amount, and privateKey.
 * The transaction is created and added to the blockchain if valid.
 */
router.post('/', async (req, res) => {
  await TransactionController.createTransaction(req, res);
});

/**
 * GET /transactions/:address
 * Route for retrieving transactions associated with a specific address.
 * It extracts the address from the URL parameter and returns all transactions for that address.
 */
router.get('/:address', async (req, res) => {
  await TransactionController.getTransactionsForAddress(req, res);
});

/**
 * POST /transactions/validate
 * Route for validating the integrity and rules compliance of a transaction.
 * It expects a JSON body with a transaction object and returns whether the transaction is valid or not.
 */
router.post('/validate', async (req, res) => {
  await TransactionController.validateTransaction(req, res);
});

module.exports = router;
