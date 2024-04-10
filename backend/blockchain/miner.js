/**
 * @file miner.js
 * @description Dedicated module for handling mining operations, including mining blocks, distributing mining rewards,
 * and adjusting the mining difficulty as necessary.
 */

const Blockchain = require("./Blockchain"); // Assuming Blockchain contains the core blockchain functionality
const Transaction = require("./Transaction"); // Assuming Transaction handles transaction creation
const Wallet = require("./Wallet"); // Assuming Wallet handles wallet operations, including generating mining rewards

class Miner {
  /**
   * Initializes a new Miner instance.
   * @param {Blockchain} blockchain - The blockchain instance this miner will operate on.
   * @param {TransactionPool} transactionPool - The pool of pending transactions this miner will include in new blocks.
   * @param {Wallet} wallet - The miner's wallet, which receives the mining rewards.
   * @param {string} blockchainAddress - The blockchain address of the miner for receiving rewards.
   */
  constructor(blockchain, transactionPool, wallet, blockchainAddress) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.blockchainAddress = blockchainAddress;
  }

  /**
   * Mines a new block by including transactions from the transaction pool and adding it to the blockchain.
   * This method also handles the distribution of mining rewards.
   * @returns {Block} The newly mined block.
   */
  mine() {
    // Step 1: Prepare transactions from the pool for inclusion
    const validTransactions = this.transactionPool.getValidTransactions();
    validTransactions.push(
      Transaction.rewardTransaction(this.wallet, this.blockchainAddress)
    );

    // Step 2: Mine the block with transactions
    const newBlock = this.blockchain.addBlock(validTransactions);

    // Step 3: Clear the transaction pool of transactions included in the newly mined block
    this.transactionPool.clear();

    // Step 4: Broadcast the newly mined block to the network (Assuming this functionality exists)
    // network.broadcast(newBlock);

    // Step 5: Return the newly mined block
    return newBlock;
  }

  /**
   * Adjusts the mining difficulty dynamically based on recent block times and the desired block time interval.
   * This method may be called periodically or after mining a block, depending on the blockchain's needs.
   */
  adjustDifficulty() {
    this.blockchain.adjustDifficulty();
  }
}

module.exports = Miner;
