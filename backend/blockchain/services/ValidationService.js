const Transaction = require("../models/TransactionModel");
const Block = require('../models/BlockModel');


/**
 * Class providing validation services for the blockchain.
 */
class ValidationService {
  /**
   * Validates a transaction.
   * @param {Transaction} transaction - The transaction to validate.
   * @returns {boolean} True if the transaction is valid, otherwise throws an error.
   */
  static validateTransaction(transaction) {
    if (!(transaction instanceof Transaction)) {
      throw new Error("Invalid transaction type.");
    }

    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaction must include from and to address.");
    }

    if (!Number.isFinite(transaction.amount) || transaction.amount <= 0) {
      throw new Error("Transaction amount must be a positive number.");
    }

    if (!transaction.signature || transaction.signature.length === 0) {
      throw new Error("Transaction must be signed.");
    }

    if (!transaction.isValid()) {
      throw new Error("Invalid transaction signature.");
    }

    return true;
  }

  /**
   * Validates the sequence of blocks in the blockchain.
   * Checks for proper linkage and integrity of each block.
   * @param {Block[]} chain - The blockchain to validate.
   * @returns {boolean} True if the chain is valid, otherwise throws an error.
   */
  static validateChain(chain) {
    if (!Array.isArray(chain) || chain.length === 0) {
      throw new Error('Invalid blockchain.');
    }

    for (let i = 1; i < chain.length; i++) {
      const currentBlock = chain[i];
      const previousBlock = chain[i - 1];

      if (!(currentBlock instanceof Block) || !(previousBlock instanceof Block)) {
        throw new Error('Invalid block type.');
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        throw new Error('Chain is broken. Previous hash does not match.');
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        throw new Error('Invalid hash on block ' + currentBlock.index);
      }

    }

    return true;
  }

  /**
   * Validates a single block.
   * @param {Block} block - The block to validate.
   * @returns {boolean} True if the block is valid, otherwise throws an error.
   */
  static validateBlock(block) {
    if (!(block instanceof Block)) {
      throw new Error('Invalid block type.');
    }

    if (block.hash !== block.calculateHash()) {
      throw new Error(`Invalid hash on block ${block.index}`);
    }

    // Validate each transaction in the block
    block.transactions.forEach(transaction => {
      if (!this.validateTransaction(transaction)) {
        throw new Error(`Invalid transaction in block ${block.index}`);
      }
    });

    return true;
  }

  /**
   * Validates a blockchain address.
   * @param {string} address - The address to validate.
   * @returns {boolean} True if the address is valid, otherwise false.
   */
  static validateAddress(address) {
    // This should be replaced with blockchain's actual address format requirements
    if (typeof address !== 'string' || address.length < 10) {
      throw new Error('Invalid address format.');
    }

    return true;
  }
  
}

module.exports = ValidationService;
