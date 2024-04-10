/**
 * @fileoverview Implementation of a blockchain block, utilizing custom crypto utilities for enhanced security.
 * This block structure includes Merkle Trees for efficient and secure verification of transaction integrity.
 */

const { hashSHA256 } = require("../lib/crypto");
const MerkleTree = require("../lib/merkleTree");

/**
 * Class representing a block in the blockchain.
 * Incorporates Merkle Trees for transaction integrity verification and uses SHA-256 hashing for the block itself.
 */
class Block {
  /**
   * Constructs a Block instance.
   * @param {number} index The block's position within the chain.
   * @param {string} previousHash The hash of the previous block in the chain.
   * @param {number} timestamp The block's creation timestamp.
   * @param {Array<Object>} transactions The transactions included in the block.
   * @param {number} nonce The nonce used for mining, serving as a proof-of-work mechanism.
   */
  constructor(index, previousHash, timestamp, transactions, nonce = 0) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.nonce = nonce;
    this.merkleRoot = this.calculateMerkleRoot(); // The Merkle Root of transactions
    this.hash = this.calculateHash(); // The hash of the block, ensuring integrity
  }

  /**
   * Calculates the Merkle Root for the transactions included in this block.
   * The Merkle Tree is built using the transaction objects, and the root hash is extracted for integrity verification.
   * @returns {string} The Merkle Root of the transactions, ensuring transaction integrity.
   */
  calculateMerkleRoot() {
    const merkleTree = new MerkleTree(
      this.transactions.map((tx) => hashSHA256(JSON.stringify(tx)))
    );
    return merkleTree.getRoot();
  }

  /**
   * Calculates the SHA-256 hash of the block, incorporating its index, previousHash, timestamp, merkleRoot, and nonce.
   * This hash serves as the block's unique identifier and ensures its integrity.
   * @returns {string} The hash of the block, as a SHA-256 string.
   */
  calculateHash() {
    const hashContent = `${this.index}${this.previousHash}${
      this.timestamp
    }${JSON.stringify(this.transactions)}${this.merkleRoot}${this.nonce}`;
    return hashSHA256(hashContent);
  }

  /**
   * Mines a new block by performing a proof-of-work operation.
   * Adjusts the nonce until the hash of the block starts with enough zeros (difficulty level).
   * @param {number} difficulty The difficulty level of the proof-of-work operation.
   */
  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  /**
   * Validates the integrity of the transactions within the block using the Merkle Root.
   * Assumes transactions have a validate method to check their individual integrity.
   * @returns {boolean} The validity of the transactions within the block.
   */
  async validateTransactions() {
    const recalculatedMerkleRoot = this.calculateMerkleRoot();
    if (this.merkleRoot !== recalculatedMerkleRoot) {
      return false;
    }

    for (let tx of this.transactions) {
      if (!(await tx.validate())) {
        return false;
      }
    }

    return true;
  }

  /**
   * Provides a string representation of the block for logging or debugging purposes.
   * Includes all key properties of the block.
   * @returns {string} A descriptive string of the block's key attributes.
   */
  toString() {
    return `Block -
                Index: ${this.index}, 
                Hash: ${this.hash}, 
                Previous Hash: ${this.previousHash}, 
                Timestamp: ${this.timestamp}, 
                Transactions: ${JSON.stringify(this.transactions)}, 
                Merkle Root: ${this.merkleRoot},
                Nonce: ${this.nonce}`;
  }
}

module.exports = Block;
