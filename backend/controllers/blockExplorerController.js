/**
 * @file blockExplorerController.js
 * @description Controller for block explorer functionalities, providing endpoints for fetching and displaying detailed information about blocks, transactions, and overall blockchain network statistics.
 */

const Blockchain = require("./Blockchain"); // Import Blockchain model
const Transaction = require("./Transaction"); // Import Transaction model

class BlockExplorerController {
  /**
   * Creates a controller instance for the block explorer.
   * @param {Blockchain} blockchain The blockchain instance to query for data.
   */
  constructor(blockchain) {
    this.blockchain = blockchain;
  }

  /**
   * Fetches and returns data about the latest blocks in the blockchain.
   * @param {Request} req The request object.
   * @param {Response} res The response object.
   */
  getLatestBlocks(req, res) {
    try {
      const latestBlocks = this.blockchain.getLatestBlocks(); // Assume this method exists and fetches latest N blocks
      res.json(latestBlocks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Looks up and returns data for a transaction given its hash.
   * @param {Request} req The request object.
   * @param {Response} res The response object.
   */
  getTransactionByHash(req, res) {
    const { hash } = req.params;
    try {
      const transaction = this.blockchain.getTransactionByHash(hash); // Assume this method exists
      if (transaction) {
        res.json(transaction);
      } else {
        res.status(404).json({ error: "Transaction not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Retrieves and returns the transaction history for a specified wallet address.
   * @param {Request} req The request object.
   * @param {Response} res The response object.
   */
  getTransactionsByAddress(req, res) {
    const { address } = req.params;
    try {
      const transactions = this.blockchain.getTransactionsByAddress(address); // Assume this method exists
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Fetches and returns aggregate network statistics, such as total transactions and average block time.
   * @param {Request} req The request object.
   * @param {Response} res The response object.
   */
  getNetworkStats(req, res) {
    try {
      const stats = this.blockchain.getNetworkStats(); // Assume this method exists and calculates necessary statistics
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = BlockExplorerController;
