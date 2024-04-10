/**
 * @file Blockchain.js
 * @description Implementation of the core Blockchain class, focusing on block and chain integrity, dynamic genesis block creation, and efficient mining and validation processes.
 */

const Block = require("./Block");
const Transaction = require("./Transaction");
const { hashSHA256 } = require("../lib/crypto");
const MerkleTree = require("../lib/merkleTree");

class Blockchain {
  /**
   * Initializes a new blockchain instance.
   */
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
    this.blockTime = 30000; // Target time to mine a block, in milliseconds.
    this.nodes = new Set(); // A set to keep track of peer nodes.
  }

  /**
   * Creates the genesis block for the blockchain.
   * @returns {Block} The genesis block.
   */
  createGenesisBlock() {
    const genesisTransaction = new Transaction(null, "genesis-address", 0);
    return new Block(Date.parse("2024-01-01"), [genesisTransaction], "0");
  }

  /**
   * Gets the latest block in the blockchain.
   * @returns {Block} The latest block.
   */
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Adds a new transaction to the list of pending transactions.
   * @param {Transaction} transaction - The transaction to add.
   */
  addTransaction(transaction) {
    if (!transaction.isValid()) {
      throw new Error("Invalid transaction.");
    }
    this.pendingTransactions.push(transaction);
  }

  /**
   * Mines all pending transactions into a block.
   * @param {string} miningRewardAddress - The address to receive the mining reward.
   */
  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTx);

    const block = new Block(
      Date.now(),
      this.pendingTransactions,
      this.getLatestBlock().hash
    );
    block.mineBlock(this.difficulty);

    this.adjustDifficulty(block);
    this.chain.push(block);

    this.pendingTransactions = [];
  }

  /**
   * Adjusts the difficulty of the next block based on the time taken to mine the last block.
   * @param {Block} lastBlock - The most recently mined block.
   */
  adjustDifficulty(lastBlock) {
    const timeTaken = lastBlock.timestamp - this.getLatestBlock().timestamp;
    if (timeTaken < this.blockTime / 2) {
      this.difficulty++;
    } else if (timeTaken > this.blockTime * 2) {
      this.difficulty--;
    }
  }

  /**
   * Validates the blockchain's integrity.
   * @returns {boolean} True if valid, false otherwise.
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }

  /**
   * Constructs and returns a merkle tree of all pending transactions.
   * Useful for efficiently verifying transaction existence in a block without needing the complete block data.
   * @returns {MerkleTree} The merkle tree of the pending transactions.
   */
  getPendingTransactionsMerkleTree() {
    const leaves = this.pendingTransactions.map((tx) =>
      hashSHA256(tx.toString())
    );
    return new MerkleTree(leaves, hashSHA256);
  }

  /**
   * Broadcasts the latest block to all peer nodes. This method should be called after a new block is mined and added to the chain.
   */
  broadcastLatestBlock() {
    this.nodes.forEach((node) => {
      // Implementation to send the latest block to the node.
      // This could be a POST request to an endpoint like node.url + '/receive-block' with the latest block as the body.
    });
  }

  /**
   * Adds a new node to the list of peer nodes.
   * @param {string} nodeUrl - The URL of the node to add.
   */
  addNode(nodeUrl) {
    this.nodes.add(nodeUrl);
  }

  /**
   * Handles incoming blockchain synchronization requests. This method is designed to be called when a node receives a new block or blockchain from a peer.
   * It validates the incoming chain and decides whether to accept the new chain or keep the current one.
   * @param {Blockchain} newChain - The incoming blockchain.
   * @returns {boolean} True if the incoming chain was accepted, false otherwise.
   */
  synchronizeChain(newChain) {
    // Validate the incoming chain.
    if (!this.isValidChain(newChain) || newChain.length <= this.chain.length) {
      return false; // Reject if the new chain is invalid or not longer.
    }

    // Accept the new chain and replace our current one.
    this.chain = newChain;
    this.broadcastLatestBlock(); // Broadcast the latest block to ensure all nodes are synchronized.
    return true;
  }
}

module.exports = Blockchain;
