const Transaction = require('../models/TransactionModel');

/**
 * @class TransactionService
 * @description Provides services related to handling transactions within the blockchain, including creation, validation, and querying. Adjusted to handle special transactions like genesis or reward blocks where sender address can be null.
 */
class TransactionService {
  /**
   * Creates and saves a new transaction, considering cases where the fromAddress can be null.
   * @param {string|null} fromAddress - The wallet address of the sender, or null for genesis/reward transactions.
   * @param {string} toAddress - The wallet address of the recipient.
   * @param {number} amount - The amount to be transferred.
   * @param {string} signature - The signature to verify the transaction, required for all transactions.
   * @returns {Promise<TransactionModel>} A new signed and saved transaction.
   */
  static async createTransaction(fromAddress, toAddress, amount, signature) {
    if (!toAddress || amount <= 0 || !signature) {
      throw new Error(
        "Missing or invalid parameters for transaction creation."
      );
    }

    const transaction = new Transaction({
      fromAddress,
      toAddress,
      amount,
      signature,
    });
    if (!(await transaction.isValid())) {
      throw new Error("Failed to create a valid transaction.");
    }
    await transaction.save().catch((error) => {
      throw new Error(`Failed to save the transaction: ${error.message}`);
    });
    return transaction;
  }

  /**
   * Validates a transaction to ensure it is correctly signed and meets the network's rules.
   * @param {TransactionModel} transaction - The transaction to validate.
   * @returns {Promise<boolean>} True if the transaction is valid, false otherwise.
   */
  static async validateTransaction(transaction) {
    if (!(transaction instanceof Transaction)) {
      throw new Error("Invalid transaction format.");
    }
    return transaction.isValid();
  }

  /**
   * Retrieves transactions involving a specific wallet address.
   * @param {string} address - The wallet address to query transactions for.
   * @returns {Promise<TransactionModel[]>} An array of transactions involving the specified address.
   */
  static async getTransactionsForAddress(address) {
    const transactions = await Transaction.find({
      $or: [{ fromAddress: address }, { toAddress: address }],
    }).exec();
    return transactions;
  }

  /**
   * Aggregates the total volume of transactions for a specific address.
   * @param {string} address - The wallet address to aggregate transactions for.
   * @returns {Promise<number>} The total volume of transactions involving the specified address.
   */
  static async aggregateTransactionVolume(address) {
    const transactions = await this.getTransactionsForAddress(address);
    const volume = transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );
    return volume;
  }

  /**
   * Validates the sufficiency of balance for transaction creation, including fees.
   * @param {string} fromAddress - The sender's address.
   * @param {number} amount - The amount to be sent.
   * @returns {Promise<boolean>} True if the balance is sufficient, false otherwise.
   */
  static async isBalanceSufficient(fromAddress, amount) {
    const balance = await this.aggregateTransactionVolume(fromAddress);
    const fee = this.calculateTransactionFee({ amount }); // Assuming a function to calculate fee
    return balance - amount - fee >= 0;
  }

  /**
   * Calculates the transaction fee based on the transaction details.
   * @param {Object} transaction - The transaction data.
   * @returns {number} The calculated fee.
   */
  static calculateTransactionFee(transaction) {
    // Example fee calculation logic
    return transaction.amount * 0.01; // 1% fee
  }
}

module.exports = TransactionService;
