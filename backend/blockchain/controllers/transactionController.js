const TransactionService = require("../services/TransactionService");
const BlockchainService = require("../services/BlockchainService");

/**
 * @class TransactionController
 * @description Controller for handling transaction-related operations within the blockchain.
 */
class TransactionController {
  static blockchainService = new BlockchainService(); // Create an instance of BlockchainService

  /**
   * Handles the creation and submission of a new transaction to the blockchain.
   * Verifies the blockchain's integrity before proceeding.
   * @param {Request} req - The HTTP request object containing the transaction details.
   * @param {Response} res - The HTTP response object.
   */
  static async createTransaction(req, res) {
    try {
      const { fromAddress, toAddress, amount, privateKey } = req.body;

      // Check blockchain integrity before processing transactions
      if (!(await this.blockchainService.isChainValid())) {
        // Use the instance to call isChainValid
        return res.status(403).json({
          message:
            "Blockchain integrity is compromised, cannot process transactions.",
        });
      }

      // Create and validate new transaction
      const transaction = await TransactionService.createTransaction(
        fromAddress,
        toAddress,
        amount,
        privateKey
      );

      if (!(await transaction.isValid())) {
        return res
          .status(400)
          .json({ message: "Failed to create a valid transaction." });
      }

      // Add the transaction to the blockchain
      await this.blockchainService.addTransaction(transaction); // Use the instance to add the transaction

      res.json({
        message: "Transaction successfully created and submitted.",
        transaction,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Failed to create transaction: ${error.message}` });
    }
  }

  /**
   * Retrieves all transactions associated with a specific blockchain address.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  static getTransactionsForAddress(req, res) {
    try {
      const { address } = req.params;
      const transactions = TransactionService.getTransactionsForAddress(
        address,
        BlockchainService.getChain()
      );

      res.json({ transactions });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Failed to retrieve transactions: ${error.message}` });
    }
  }

  /**
   * Validates the integrity and rules compliance of a specified transaction.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  static validateTransaction(req, res) {
    try {
      const { transaction } = req.body;
      const isValid = TransactionService.validateTransaction(transaction);

      if (!isValid) {
        return res.status(400).json({ message: "Transaction is invalid." });
      }

      res.json({ message: "Transaction is valid." });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Failed to validate transaction: ${error.message}` });
    }
  }
}

module.exports = TransactionController;
