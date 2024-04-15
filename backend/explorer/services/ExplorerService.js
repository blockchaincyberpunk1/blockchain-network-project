const BlockchainService = require("../../blockchain/services/BlockchainService");

/**
 * @class ExplorerService
 * @description Service responsible for exploring blockchain data, including viewing blocks,
 * transactions, and computing address balances.
 */
class ExplorerService {
  /**
   * Constructs the ExplorerService with a dependency on BlockchainService.
   * @param {BlockchainService} blockchainService - The blockchain service instance used for querying blockchain data.
   * @throws {Error} Throws an error if a valid BlockchainService instance is not provided.
   */
  constructor(blockchainService) {
    if (!blockchainService || !(blockchainService instanceof BlockchainService)) {
      throw new Error("A valid BlockchainService instance is required to initialize ExplorerService.");
    }
    this.blockchainService = blockchainService;
  }

  /**
   * Retrieves the entire blockchain data.
   * @returns {Block[]} The entire blockchain.
   * @throws {Error} Throws an error if the blockchain cannot be retrieved.
   */
  getBlockchain() {
    try {
      return this.blockchainService.getChain();
    } catch (error) {
      console.error("Error retrieving the blockchain:", error);
      throw new Error("Failed to retrieve the blockchain.");
    }
  }

  /**
   * Fetches a single block by its index.
   * @param {number} index - The index of the block to retrieve.
   * @returns {Block|null} The block if found, or null if no block exists at the given index.
   * @throws {Error} Throws an error if the block cannot be retrieved.
   */
  getBlockByIndex(index) {
    try {
      const blockchain = this.blockchainService.getChain();
      return blockchain.length > index ? blockchain[index] : null;
    } catch (error) {
      console.error(`Error retrieving the block at index ${index}:`, error);
      throw new Error(`Failed to retrieve the block at index ${index}.`);
    }
  }

  /**
   * Fetches transactions associated with a specific wallet address.
   * @param {string} address - The address to get transactions for.
   * @returns {Transaction[]} An array of transactions associated with the address.
   * @throws {Error} Throws an error if transactions cannot be retrieved.
   */
  getTransactionsForAddress(address) {
    try {
      const blockchain = this.blockchainService.getChain();
      let transactions = [];
      blockchain.forEach(block => {
        block.transactions.forEach(transaction => {
          if (transaction.fromAddress === address || transaction.toAddress === address) {
            transactions.push(transaction);
          }
        });
      });
      return transactions;
    } catch (error) {
      console.error(`Error retrieving transactions for address ${address}:`, error);
      throw new Error(`Failed to retrieve transactions for address ${address}.`);
    }
  }

  /**
   * Computes the balance of a given address by iterating through the blockchain.
   * @param {string} address - The address to query the balance for.
   * @returns {number} The balance of the address.
   * @throws {Error} Throws an error if the balance cannot be retrieved.
   */
  getAddressBalance(address) {
    try {
      return this.blockchainService.getBalanceOfAddress(address);
    } catch (error) {
      console.error(`Error retrieving balance for address ${address}:`, error);
      throw new Error(`Failed to retrieve balance for address ${address}.`);
    }
  }
}

module.exports = ExplorerService;
