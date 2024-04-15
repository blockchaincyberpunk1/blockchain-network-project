/**
 * @file TransactionModel.js
 * @description Defines the MongoDB model for transactions in the blockchain, ensuring each transaction is correctly formatted and validated. This model allows the fromAddress to be null for special transactions like genesis or reward blocks.
 */

const mongoose = require("mongoose");

/**
 * Transaction schema for blockchain operations with specific validation rules to handle different types of transactions, including genesis and reward.
 */
const transactionSchema = new mongoose.Schema(
  {
    fromAddress: {
      type: String,
      required: [
        function () {
          // Allow 'null' only for special cases like reward transactions
          return this.fromAddress !== null || this.isReward === true;
        },
        "Sender address is required unless it is a genesis or reward transaction",
      ],
      default: null,
      trim: true,
    },
    toAddress: {
      type: String,
      required: [true, "Recipient address is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: [0.01, "Minimum transaction amount is 0.01"],
    },
    signature: {
      type: String,
      required: function () {
        // Signature is not required for genesis or reward transactions
        return this.fromAddress !== null;
      },
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isReward: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Post-save hook for handling errors during transaction save operations, specifically focusing on validation errors.
 */
transactionSchema.post("save", function (error, doc, next) {
  if (error.name === "ValidationError") {
    const errorMessages = Object.values(error.errors)
      .map((err) => err.message)
      .join(", ");
    next(new Error(`Transaction validation failed: ${errorMessages}`));
  } else {
    next(error); // Pass on any other errors that aren't validation-related
  }
});

/**
 * Method to validate a transaction's integrity and correctness.
 * This includes signature verification (mocked here) and ensuring the transaction amount is positive.
 * @returns {Promise<boolean>} Resolves to true if the transaction is valid, false otherwise.
 */
transactionSchema.methods.isValid = async function () {
  if (!this.signature || this.signature.length === 0) {
    return false;
  }

  // Ensure the transaction has a positive amount
  if (this.amount <= 0) {
    return false;
  }

  return true;
};

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
