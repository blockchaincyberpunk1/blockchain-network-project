/**
 * @file TransactionPool.js
 * @description Manages the pool of transactions, including adding, updating, and removing transactions based on their lifecycle.
 * Enhancements include mechanisms to handle transaction statuses and segregate transactions based on their confirmation status.
 */

const Transaction = require("./Transaction");

class TransactionPool {
  /**
   * Initializes the transaction pool with separate lists for different transaction states.
   */
  constructor() {
    this.pendingTransactions = []; // Transactions that have not been included in a block yet.
    this.confirmedTransactions = []; // Transactions included in a block but not yet confirmed.
  }

  /**
   * Adds a new transaction to the pool or updates an existing one, depending on its status.
   * @param {Transaction} transaction - The transaction object to add or update.
   */
  addOrUpdateTransaction(transaction) {
    let targetPool;
    switch (transaction.status) {
      case "pending":
        targetPool = this.pendingTransactions;
        break;
      case "confirmed":
        targetPool = this.confirmedTransactions;
        break;
      default:
        throw new Error(
          `Unsupported transaction status: ${transaction.status}`
        );
    }

    const transactionIndex = targetPool.findIndex(
      (t) => t.id === transaction.id
    );

    if (transactionIndex !== -1) {
      // Update existing transaction with new data.
      targetPool[transactionIndex] = transaction;
    } else {
      // Add new transaction to the appropriate pool.
      targetPool.push(transaction);
    }
  }

  /**
   * Moves a transaction from the pending pool to the confirmed pool.
   * @param {string} transactionId - The ID of the transaction to update.
   */
  confirmTransaction(transactionId) {
    const transactionIndex = this.pendingTransactions.findIndex(
      (t) => t.id === transactionId
    );
    if (transactionIndex !== -1) {
      const [transaction] = this.pendingTransactions.splice(
        transactionIndex,
        1
      );
      transaction.updateStatus("confirmed");
      this.confirmedTransactions.push(transaction);
    }
  }

  /**
   * Retrieves a transaction by its ID, searching both pending and confirmed pools.
   * @param {string} id - The unique identifier of the transaction.
   * @returns {Transaction|null} The transaction object if found, otherwise null.
   */
  findTransactionById(id) {
    return (
      this.pendingTransactions.find((t) => t.id === id) ||
      this.confirmedTransactions.find((t) => t.id === id) ||
      null
    );
  }

  /**
   * Retrieves all transactions currently in the pool, both pending and confirmed.
   * @returns {Transaction[]} An array of all transaction objects in the pool.
   */
  getAllTransactions() {
    return [...this.pendingTransactions, ...this.confirmedTransactions];
  }

  /**
   * Removes transactions from the pool. This is typically used when transactions are confirmed and thus
   * no longer need to be in either the pending or confirmed pools.
   * @param {Transaction[]} transactionsToRemove - An array of transactions that should be removed.
   */
  removeTransactions(transactionsToRemove) {
    this.pendingTransactions = this.pendingTransactions.filter(
      (t) => !transactionsToRemove.includes(t)
    );
    this.confirmedTransactions = this.confirmedTransactions.filter(
      (t) => !transactionsToRemove.includes(t)
    );
  }
}

module.exports = TransactionPool;
