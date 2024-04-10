/**
 * @file blockchainController.js
 * @description Controller for handling blockchain operations. This includes creating transactions,
 * mining blocks, and retrieving blockchain data, with input validation to ensure data integrity.
 */

const Blockchain = require("../models/Blockchain"); // Adjust the path as necessary
const blockchain = new Blockchain();

// Assuming a method for validating transactions exists
const { validateTransaction } = require("../validators/transactionValidator");

// Assuming utility functions for blockchain synchronization
const {
  synchronizeWithNode,
  fetchBlockchainState,
} = require("../utils/blockchainSynchronization");

/**
 * Synchronizes the blockchain with another node. Updates the current node's blockchain to match that of the target node if needed.
 * @param {Request} req - The Express.js request object, potentially containing the target node's information.
 * @param {Response} res - The Express.js response object.
 */
exports.synchronizeBlockchain = async (req, res) => {
  try {
    const { targetNodeUrl } = req.body;
    const updated = await synchronizeWithNode(targetNodeUrl, blockchain);
    if (updated) {
      res.status(200).json({
        message: "Blockchain synchronized successfully with the target node.",
        blockchain: blockchain.chain,
      });
    } else {
      res.status(200).json({
        message: "Already up to date with the target node.",
        blockchain: blockchain.chain,
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Fetches detailed transaction history for a given address, including incoming and outgoing transactions.
 * @param {Request} req - The Express.js request object, containing the wallet address.
 * @param {Response} res - The Express.js response object.
 */
exports.getTransactionHistory = (req, res) => {
  const { address } = req.params;
  if (!address) {
    return res.status(400).json({ error: "Wallet address is required." });
  }
  const transactions = blockchain.getTransactionsOfAddress(address);
  if (!transactions) {
    return res
      .status(404)
      .json({ error: "No transactions found for this address." });
  }
  res.json({ address, transactions });
};

/**
 * Retrieves detailed information for a specific block identified by its hash.
 * @param {Request} req - The Express.js request object, containing the block hash.
 * @param {Response} res - The Express.js response object.
 */
exports.getBlockByHash = (req, res) => {
  const { hash } = req.params;
  const block = blockchain.getBlockByHash(hash);
  if (!block) {
    return res.status(404).json({ error: "Block not found." });
  }
  res.status(200).json({ block });
};

/**
 * Endpoint for retrieving the blockchain's current state, useful for node synchronization and data visibility.
 * @param {Request} req - The Express.js request object.
 * @param {Response} res - The Express.js response object.
 */
exports.getBlockchainState = (req, res) => {
  const state = fetchBlockchainState(blockchain);
  res.status(200).json(state);
};
/**
 * Creates a new transaction and adds it to the blockchain.
 * Validates input before processing to enhance security.
 * @param {Request} req - The Express.js request object.
 * @param {Response} res - The Express.js response object.
 */
exports.createTransaction = (req, res) => {
  const transaction = req.body;
  const validationResult = validateTransaction(transaction);
  if (validationResult !== true) {
    return res.status(400).json({ error: validationResult });
  }

  try {
    const newTransactionIndex = blockchain.addTransaction(
      transaction.sender,
      transaction.recipient,
      transaction.amount
    );
    res.status(201).json({
      message: `Transaction will be added to block ${newTransactionIndex}.`,
      transactionIndex: newTransactionIndex,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Mines a new block and adds it to the blockchain. Validates the mining process
 * and responds with the newly mined block.
 * @param {Request} req - The Express.js request object.
 * @param {Response} res - The Express.js response object.
 */
exports.mineBlock = (req, res) => {
  try {
    const newBlock = blockchain.minePendingTransactions(
      req.body.miningRewardAddress
    );
    res.status(201).json({
      message: "New block mined successfully",
      block: newBlock,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieves the entire blockchain. This method provides a complete view of the
 * current state of the blockchain.
 * @param {Request} req - The Express.js request object.
 * @param {Response} res - The Express.js response object.
 */
exports.getChain = (req, res) => {
  res.status(200).json(blockchain.chain);
};

/**
 * Retrieves the last block in the blockchain. Useful for clients needing to quickly
 * get the latest block details.
 * @param {Request} req - The Express.js request object.
 * @param {Response} res - The Express.js response object.
 */
exports.getLastBlock = (req, res) => {
  res.status(200).json(blockchain.getLatestBlock());
};

/**
 * Retrieves the balance for a given wallet address.
 * Validates the address input and responds with the balance, differentiating between confirmed and pending.
 * @param {Request} req - The Express.js request object.
 * @param {Response} res - The Express.js response object.
 */
exports.getBalance = (req, res) => {
  const { address } = req.params;
  if (!address) {
    return res.status(400).json({ error: "Address parameter is missing." });
  }

  try {
    const balance = blockchain.getBalanceOfAddress(address);
    res.status(200).json({
      address,
      balance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Adjusts the mining difficulty dynamically based on the timestamp of the last block and the current time.
 * This endpoint could be triggered periodically or through specific conditions in the blockchain network.
 * @param {Request} req - The Express.js request object.
 * @param {Response} res - The Express.js response object.
 */
exports.adjustMiningDifficulty = (req, res) => {
  try {
    const newDifficulty = blockchain.adjustDifficulty();
    res.status(200).json({
      message: "Mining difficulty adjusted successfully",
      newDifficulty,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Synchronizes the current blockchain with another node.
 * This could involve fetching the latest blockchain state from a peer and resolving any conflicts.
 * @param {Request} req - The Express.js request object.
 * @param {Response} res - The Express.js response object.
 */
exports.synchronizeBlockchain = (req, res) => {
  try {
    blockchain.synchronizeChain();
    res.status(200).json({
      message: "Blockchain synchronized successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
