/**
 * @file Transaction.js
 * @description Model representing a transaction in the blockchain network with validations and indexing for key fields.
 */

const mongoose = require("mongoose");

/**
 * Schema for a blockchain transaction.
 *
 * @typedef {Object} TransactionSchema
 * @property {String} sender - The address of the sender.
 * @property {String} recipient - The address of the recipient.
 * @property {Number} amount - The amount of cryptocurrency being transferred.
 */
const TransactionSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: [true, "Sender address is required"],
      index: true, // Improves query performance for transactions by sender.
    },
    recipient: {
      type: String,
      required: [true, "Recipient address is required"],
      index: true, // Improves query performance for transactions by recipient.
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: [1, "Transaction amount must be at least 1"], // Ensures transaction amount is positive.
    },
    type: {
      type: String,
      required: true,
      enum: ["standard", "faucet"], // Specifies the transaction type.
      default: "standard",
    },
  },
  { timestamps: true }
); // Includes creation and update timestamps automatically.

/**
 * Pre-save middleware to perform transaction-specific validations or processing.
 * This could include verifying the transaction against current blockchain state,
 * ensuring balance sufficiency, etc.
 */
TransactionSchema.pre("save", async function (next) {
  // Example validation: Ensure sender has sufficient balance (pseudocode).
  // let balance = await Blockchain.getAccountBalance(this.sender);
  // if (this.amount > balance) throw new Error('Insufficient balance for transaction.');

  next();
});

/**
 * Static method to validate transaction data outside of the database save operation.
 * This can be used to preemptively check the validity of a transaction.
 * @param {Object} transactionData - The transaction data to validate.
 * @returns {Boolean} - Returns true if the transaction is valid, otherwise throws an error.
 */
TransactionSchema.statics.validateTransaction = function (transactionData) {
  // Implement validation logic here. Example:
  // if (transactionData.amount <= 0) throw new Error('Transaction amount must be positive.');

  return true; // Placeholder return value. Replace with actual validation logic.
};

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;
