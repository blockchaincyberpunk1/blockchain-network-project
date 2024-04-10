/**
 * @file balanceManager.js
 * @description Utility module for managing and calculating wallet balances, including confirmed, pending, and available balances.
 */

const Blockchain = require("./Blockchain"); // Import the Blockchain class
const TransactionStatus = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
};

class BalanceManager {
  /**
   * Constructs a new BalanceManager instance.
   * @param {Blockchain} blockchain - The blockchain instance to query for transaction data.
   */
  constructor(blockchain) {
    this.blockchain = blockchain;
  }

  /**
   * Calculates the confirmed balance for a given wallet address.
   * Confirmed balance refers to the sum of all confirmed transactions.
   * @param {string} address - The wallet address.
   * @returns {number} The confirmed balance.
   */
  calculateConfirmedBalance(address) {
    return this.calculateBalance(address, TransactionStatus.CONFIRMED);
  }

  /**
   * Calculates the pending balance for a given wallet address.
   * Pending balance includes all pending outgoing transactions that are not yet confirmed.
   * @param {string} address - The wallet address.
   * @returns {number} The pending balance.
   */
  calculatePendingBalance(address) {
    return this.calculateBalance(address, TransactionStatus.PENDING);
  }

  /**
   * Calculates the available balance for a given wallet address.
   * Available balance is the confirmed balance minus any pending outgoing transactions.
   * @param {string} address - The wallet address.
   * @returns {number} The available balance.
   */
  calculateAvailableBalance(address) {
    const confirmedBalance = this.calculateConfirmedBalance(address);
    const pendingBalance = this.calculatePendingBalance(address);
    return confirmedBalance - pendingBalance;
  }

  /**
   * Calculates the balance for a given wallet address based on transaction status.
   * @param {string} address - The wallet address.
   * @param {string} status - The status of the transactions to include (confirmed or pending).
   * @returns {number} The balance.
   */
  calculateBalance(address, status) {
    let balance = 0;

    this.blockchain.chain.forEach((block) => {
      block.transactions.forEach((transaction) => {
        if (transaction.status !== status) return;

        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }

        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      });
    });

    if (status === TransactionStatus.PENDING) {
      this.blockchain.pendingTransactions.forEach((transaction) => {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }
      });
    }

    return balance;
  }
}

module.exports = BalanceManager;
