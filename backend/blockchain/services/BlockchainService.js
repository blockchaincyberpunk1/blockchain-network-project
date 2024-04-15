const BlockModel = require("../models/BlockModel");
const Transaction = require("../models/TransactionModel");
const MerkleTree = require("../../lib/merkleTree");
const crypto = require("crypto");

/**
 * @class BlockchainService
 * @description Manages blockchain operations such as creating blocks, handling transactions, and validating blockchain integrity.
 * This includes mining new blocks only when there are pending transactions, and properly integrating Merkle Trees for transaction integrity.
 */
class BlockchainService {
  constructor() {
    this.difficulty = 4; // Difficulty of Proof of Work
    this.miningReward = 100; // Reward given for mining a block
    this.pendingTransactions = []; // List of pending transactions
    this.initializeBlockchain();
  }

  /**
   * Initializes the blockchain with the genesis block if it does not already exist in the database.
   */
  async initializeBlockchain() {
    const count = await BlockModel.countDocuments();
    if (count === 0) {
      const genesisBlock = await this.createGenesisBlock();
      await this.safeBlockSave(genesisBlock);
      console.log("Genesis block created and saved!");
    } else {
      console.log("Genesis block already exists.");
    }
  }

  /**
   * Creates the genesis block for the blockchain.
   * @returns {BlockModel} The genesis block.
   */

  async createGenesisBlock() {
    // Define a list of initial transactions to fund the wallets
    const initialTransactions = [
      {
        fromAddress: null, // Genesis block transactions don't have a sender
        toAddress:
          "04e21dd2ea40413d18393b7f3c22a51e55c1ca9456e02e0b9a3c0e415b135d2a9d110ed6236e0ae6d062eb70753d36329773e29f5d847b3f9d9b2f98fe3f17c2b6",
        amount: 5000, // Amount to be adjusted as needed
        timestamp: Date.now(),
        signature: "genesis-signature",
      },
      {
        fromAddress: null,
        toAddress:
          "04ae619269e81c9a45f6e9d99b777ba0c5d0b0779803deaf418e7ae5e7c2af8d4f58a807b09414521c247fe66e402125c51c9b3fd7d9525a7cc57464ad2b1f52d2",
        amount: 5000,
        timestamp: Date.now(),
        signature: "genesis-signature",
      },
      {
        fromAddress: null,
        toAddress:
          "046d97399e73236961d1984eb17fd83554ab30448d3efc3749b4fca415501981cdc9cecec27daab6edb0753e60505f9bbf4d3d3a8b917398267732302b3671962b",
        amount: 5000,
        timestamp: Date.now(),
        signature: "genesis-signature",
      },
      {
        fromAddress: null,
        toAddress:
          "0424821e7550f331fd566d54b38a1c941f1954cabd88ef908868dc878ff41d3a844f7d4032b31bbe857050dea6f4acfbba79ecc6f9b80fc38e5e9e1b0378581269",
        amount: 10000, // Larger amount for the faucet wallet
        timestamp: Date.now(),
        signature: "genesis-signature",
      },
    ];

    // Convert each object to a TransactionModel instance and insert into the database
    const genesisTransactions = initialTransactions.map(
      (tx) => new Transaction(tx)
    );
    await Transaction.insertMany(genesisTransactions);

    // Create a Merkle Tree from the transactions
    const merkleTree = new MerkleTree(
      genesisTransactions.map((tx) => JSON.stringify(tx))
    );
    const genesisBlock = new BlockModel({
      index: 0,
      previousHash: "0",
      timestamp: Date.now(),
      transactions: genesisTransactions.map((tx) => tx._id),
      nonce: 0,
      merkleRoot: merkleTree.getRoot(),
      hash: this.calculateHashForBlock(
        0,
        "0",
        Date.now(),
        merkleTree.getRoot(),
        0
      ),
    });

    return genesisBlock;
  }

  /**
   * Safely saves a block into the database with error handling to avoid duplicate key errors.
   * @param {BlockModel} block The block to be saved.
   */
  async safeBlockSave(block) {
    try {
      await block.save();
      console.log(`Block saved: ${block.index}`);
    } catch (error) {
      if (error.name === "MongoError" && error.code === 11000) {
        console.error(`Duplicate block not saved: ${block.index}`);
      } else {
        console.error(`Error saving block: ${error}`);
        throw error;
      }
    }
  }

  /**
   * Retrieves the latest block from the blockchain.
   * @returns {Promise<BlockModel>} The latest block.
   */
  async getLatestBlock() {
    return await BlockModel.findOne().sort({ index: -1 });
  }

  /**
   * Adds a transaction to the blockchain as a pending transaction.
   * @param {TransactionModel} transaction - The transaction to add.
   * @throws {Error} If the transaction is missing critical information or is invalid.
   */
  async addTransaction(transaction) {
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error("Transaction must include from and to addresses.");
    }
    if (!(await transaction.isValid())) {
      throw new Error("Cannot add invalid transaction to the chain.");
    }
    this.pendingTransactions.push(transaction);
    console.log("Added transaction to pending list:", transaction);
  }

  /**
   * Mines pending transactions in a new block, only if there are pending transactions.
   * @param {string} miningRewardAddress - The address to receive the mining reward.
   * @throws {Error} If there are no transactions to mine or if an error occurs during the mining process.
   */
  async minePendingTransactions(miningRewardAddress) {
    if (this.pendingTransactions.length === 0) {
      throw new Error("No transactions to mine.");
    }
    const latestBlock = await this.getLatestBlock();
    const rewardTransaction = new Transaction({
      fromAddress: null,
      toAddress: miningRewardAddress,
      amount: this.miningReward,
      timestamp: Date.now(),
    });
    this.pendingTransactions.push(rewardTransaction);
    const transactionData = this.pendingTransactions.map((tx) =>
      JSON.stringify(tx)
    );
    const merkleTree = new MerkleTree(transactionData);

    const newBlock = new BlockModel({
      index: latestBlock.index + 1,
      previousHash: latestBlock.hash,
      timestamp: Date.now(),
      transactions: this.pendingTransactions.map((tx) => tx._id),
      nonce: 0,
      merkleRoot: merkleTree.getRoot(),
      hash: this.calculateHashForBlock(
        latestBlock.index + 1,
        latestBlock.hash,
        Date.now(),
        merkleTree.getRoot(),
        0
      ),
    });

    await this.proofOfWork(newBlock);
    await this.safeBlockSave(newBlock);

    console.log("Block successfully mined and added to the blockchain!");
    this.pendingTransactions = []; // Clear the list of pending transactions after mining
  }

  /**
   * Implements Proof of Work mining algorithm.
   * @param {BlockModel} block - The block to mine.
   */
  async proofOfWork(block) {
    while (!block.hash.startsWith(Array(this.difficulty + 1).join("0"))) {
      block.nonce++;
      block.hash = block.calculateHash();
    }
  }

  /**
   * Validates the entire blockchain's integrity.
   * @returns {Promise<boolean>} True if the blockchain is valid, otherwise false.
   */
  async isChainValid() {
    const blocks = await BlockModel.find().sort({ index: 1 });
    for (let i = 1; i < blocks.length; i++) {
      const current = blocks[i];
      const previous = blocks[i - 1];

      if (current.previousHash !== previous.hash) {
        return false;
      }
      if (!(await current.hasValidTransactions())) {
        return false;
      }
      if (current.calculateHash() !== current.hash) {
        return false;
      }
    }
    return true;
  }

  /**
   * Gets the balance of a given address by iterating through all transactions.
   * @param {string} address - The address to query the balance for.
   * @returns {Promise<number>} The balance of the address.
   */
  async getBalanceOfAddress(address) {
    const transactions = await Transaction.find({
      $or: [{ fromAddress: address }, { toAddress: address }],
    });
    let balance = 0;
    transactions.forEach((tx) => {
      if (tx.fromAddress === address) balance -= tx.amount;
      if (tx.toAddress === address) balance += tx.amount;
    });
    return balance;
  }

  /**
   * Exposes the current state of the blockchain for querying or external operations.
   * @returns {Promise<BlockModel[]>} The current blockchain as an array of blocks.
   */
  async getChain() {
    return await BlockModel.find().sort({ index: 1 });
  }

  /**
   * Calculates the hash for a block based on its properties using SHA-256.
   * @param {number} index The block's index in the blockchain.
   * @param {string} previousHash The hash of the previous block in the chain.
   * @param {number} timestamp The timestamp when the block was created.
   * @param {string} merkleRoot The Merkle root of the block's transactions.
   * @param {number} nonce The nonce used in the mining process.
   * @returns {string} The calculated hash as a hexadecimal string.
   */
  calculateHashForBlock(index, previousHash, timestamp, merkleRoot, nonce) {
    const hashData = `${index}${previousHash}${timestamp}${merkleRoot}${nonce}`;
    return crypto.createHash("sha256").update(hashData).digest("hex");
  }
}

module.exports = BlockchainService;
