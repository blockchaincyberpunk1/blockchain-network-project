/**
 * @file walletController.js
 * @description Controller for wallet operations, enhancing security and functionality in key management, transaction signing, and balance calculation.
 */

const Blockchain = require("../models/Blockchain");
const Wallet = require("../lib/Wallet");
const TransactionPool = require("../lib/TransactionPool");
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();

/**
 * Creates a new wallet, generating secure key pairs.
 * @param {Request} req The Express request object.
 * @param {Response} res The Express response object.
 */
exports.createWallet = (req, res) => {
  const wallet = Wallet.generateSecureKeyPair();
  res.json({
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey,
  });
};

/**
 * Retrieves and calculates the confirmed, pending, and available balances for a given wallet address.
 * @param {Request} req The Express request object, containing the wallet address in the request params.
 * @param {Response} res The Express response object.
 */
exports.getBalances = (req, res) => {
  const { walletAddress } = req.params;
  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required." });
  }
  // Assuming a method in the Wallet class that can calculate balances based on the blockchain and transaction pool
  const wallet = new Wallet(walletAddress);
  const balances = wallet.calculateBalances(blockchain);
  res.json(balances);
};

/**
 * Validates and processes transaction data before adding it to the transaction pool.
 * @param {Request} req The Express request object, containing transaction data.
 * @param {Response} res The Express response object.
 */
exports.createTransaction = (req, res) => {
  const { privateKey, recipientAddress, amount } = req.body;
  if (!privateKey || !recipientAddress || amount <= 0) {
    return res.status(400).json({ error: "Invalid transaction data." });
  }

  try {
    const wallet = Wallet.fromPrivateKey(privateKey);
    const transaction = wallet.createTransaction(recipientAddress, amount);
    transactionPool.addOrUpdateTransaction(transaction);
    res.json({
      message: "Transaction successfully added to the pool.",
      transaction,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Fetches the transaction history for a specific wallet address, considering both incoming and outgoing transactions.
 * @param {Request} req The Express request object, containing the wallet address in the query.
 * @param {Response} res The Express response object.
 */
exports.getTransactionHistory = (req, res) => {
  const { walletAddress } = req.params;
  if (!walletAddress) {
    return res.status(400).json({ error: "Wallet address is required." });
  }

  const transactions = blockchain.getTransactionsOfAddress(walletAddress);
  if (!transactions) {
    return res
      .status(404)
      .json({ error: "No transactions found for this address." });
  }
  res.json({ transactions });
};

/**
 * Issues a faucet transaction to a specified recipient address, adding the transaction to the blockchain or transaction pool.
 * Assumes existence of a dedicated wallet for faucet transactions and relevant methods in the Blockchain model.
 * @param {Request} req The Express request object, containing the recipient's address and the amount.
 * @param {Response} res The Express response object.
 */
exports.issueFaucetTransaction = (req, res) => {
  const { recipientAddress, amount } = req.body;
  // Assuming faucetWallet is an instance of Wallet, initialized elsewhere with funds and keys dedicated to faucet transactions.
  const faucetTransaction = faucetWallet.createTransaction(
    recipientAddress,
    amount,
    blockchain
  );
  transactionPool.addTransaction(faucetTransaction);
  try {
    // Assuming addTransaction method broadcasts the transaction to the network or adds it to a block
    blockchain.addTransaction(faucetTransaction);
    res.status(200).json({
      message: "Faucet transaction issued successfully",
      transaction: faucetTransaction,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
