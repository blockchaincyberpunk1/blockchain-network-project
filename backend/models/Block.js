/**
 * @file Block.js
 * @description Model representing a block in the blockchain with enhanced validations and indexing for improved performance.
 */

const mongoose = require("mongoose");
const TransactionSchema = require("./Transaction").schema;
const crypto = require("crypto");

/**
 * Schema for a blockchain block, incorporating fields essential for block identification,
 * linkage in the chain, and transaction encapsulation.
 */
const BlockSchema = new mongoose.Schema(
  {
    hash: {
      type: String,
      required: [true, "Block hash is required"],
      unique: true,
      index: true,
    },
    previousHash: {
      type: String,
      required: [true, "Previous block hash is required"],
      index: true,
    },
    nonce: {
      type: Number,
      required: [true, "Nonce is required"],
    },
    timestamp: {
      type: Date,
      required: [true, "Timestamp is required"],
      default: Date.now,
    },
    transactions: [TransactionSchema],
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Index to optimize queries for the most recent blocks
BlockSchema.index({ timestamp: -1 });

/**
 * Generates a SHA-256 hash for the block.
 * @returns {String} The hash of the block.
 */
BlockSchema.methods.calculateHash = function () {
  const hash = crypto.createHash("sha256");
  hash.update(
    this.previousHash +
      this.timestamp +
      JSON.stringify(this.transactions) +
      this.nonce
  );
  return hash.digest("hex");
};

/**
 * Implements the proof-of-work algorithm for this block.
 * @param {Number} difficulty - The difficulty level of the proof-of-work algorithm.
 */
BlockSchema.methods.mineBlock = function (difficulty) {
  while (
    this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
  ) {
    this.nonce++;
    this.hash = this.calculateHash();
  }
};

/**
 * Validates all transactions within the block.
 * This method can be expanded to include further validations as per the project requirements.
 * @async
 * @returns {Promise<Boolean>} The validity of the transactions within the block.
 */
BlockSchema.methods.validateTransactions = async function () {
  for (let transaction of this.transactions) {
    // Assuming Transaction model has a method `isValid` to validate individual transactions.
    // You might need to import or reference the Transaction model here if necessary.
    if (!(await transaction.isValid())) {
      return false;
    }
  }
  return true;
};

const Block = mongoose.model("Block", BlockSchema);

module.exports = Block;
