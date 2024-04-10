/**
 * @fileoverview Enhanced implementation of a blockchain transaction.
 * This includes robust validation mechanisms and metadata to track the transaction status (confirmed, pending, available)
 * through its lifecycle in the blockchain.
 */

const SHA256 = require("crypto-js/sha256");
const { signData, verifySignature } = require("../lib/crypto");

class Transaction {
  /**
   * Initializes a new instance of a transaction.
   * @param {string} fromAddress - The sender's address.
   * @param {string} toAddress - The recipient's address.
   * @param {number} amount - The amount to be transferred.
   * @param {string} [type='standard'] - The type of transaction, e.g., 'standard', 'reward'.
   */
  constructor(fromAddress, toAddress, amount, type = "standard") {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.type = type;
    this.timestamp = Date.now();
    this.signature = null;
    this.status = "pending"; // Transaction status: pending, confirmed, available
  }

  /**
   * Calculates the SHA-256 hash of the transaction, considering all its properties.
   * @returns {string} The hash of the transaction.
   */
  calculateHash() {
    return SHA256(
      `${this.fromAddress}${this.toAddress}${this.amount}${this.type}${this.timestamp}${this.status}`
    ).toString();
  }

  /**
   * Signs the transaction with the sender's private key, ensuring its authenticity.
   * @param {string} privateKey - The private key of the sender.
   * @throws {Error} Throws an error if the transaction is missing a from address and is not a reward.
   */
  signTransaction(privateKey) {
    if (this.type !== "reward" && !this.fromAddress) {
      throw new Error("Non-reward transactions require a from address.");
    }

    const hashTx = this.calculateHash();
    this.signature = signData(hashTx, privateKey);
  }

  /**
   * Validates the transaction's signature and checks that it hasn't been tampered with.
   * @returns {boolean} True if the transaction is valid, false otherwise.
   * @throws {Error} Throws an error if there's no signature or from address.
   */
  isValid() {
    if (this.type === "reward") return true; // Reward transactions are automatically valid

    if (!this.signature || this.signature.length === 0) {
      throw new Error("Transaction must be signed.");
    }

    if (!this.fromAddress) {
      throw new Error("Transaction must have a from address.");
    }

    const hashTx = this.calculateHash();
    return verifySignature(hashTx, this.signature, this.fromAddress);
  }

  /**
   * Updates the transaction status. Intended to be called when a transaction is confirmed or becomes available for spending.
   * @param {string} newStatus - The new status of the transaction ('confirmed', 'available').
   */
  updateStatus(newStatus) {
    if (["pending", "confirmed", "available"].includes(newStatus)) {
      this.status = newStatus;
    } else {
      throw new Error(
        `Invalid status '${newStatus}' provided to updateStatus.`
      );
    }
  }

  /**
   * Provides a string representation of the transaction, including its status.
   * @returns {string} A descriptive string of the transaction.
   */
  toString() {
    return `Transaction - 
            From: ${this.fromAddress || "System"}, 
            To: ${this.toAddress}, 
            Amount: ${this.amount}, 
            Type: ${this.type}, 
            Status: ${this.status}, 
            Timestamp: ${this.timestamp}, 
            Signature: ${this.signature || "None"}`;
  }
}

module.exports = Transaction;
