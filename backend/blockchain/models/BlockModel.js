/**
 * @file BlockModel.js
 * @description Defines the MongoDB model for storing blocks in the blockchain. Each block contains a list of transactions,
 * an index, a timestamp, a nonce for the mining process, the hash of the block, and the hash of the previous block.
 */

const mongoose = require("mongoose");
const crypto = require("crypto");
const MerkleTree = require("../../lib/merkleTree");  // Adjust the path as necessary

/**
 * Schema definition for a blockchain block.
 */
const blockSchema = new mongoose.Schema({
    index: {
        type: Number,
        required: true,
        unique: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    transactions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
        required: true
    }],
    nonce: {
        type: Number,
        required: true
    },
    previousHash: {
        type: String,
        required: true
    },
    merkleRoot: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

/**
 * Pre-save middleware to calculate the block's hash and Merkle root after ensuring the transaction list is non-empty.
 */
blockSchema.pre('save', async function(next) {
    if (!this.transactions || this.transactions.length === 0) {
        return next(new Error("Block must contain at least one transaction."));
    }

    if (this.isNew || this.isModified('transactions')) {
        await this.calculateMerkleRoot();
    }
    this.hash = this.calculateHash();
    next();
});

/**
 * Calculates the Merkle root of the block's transactions using transaction data hashes.
 * @throws {Error} If unable to fetch transactions or if the transactions array is empty.
 */
blockSchema.methods.calculateMerkleRoot = async function() {
    const transactions = await this.model('Transaction').find({_id: { $in: this.transactions }});
    if (!transactions || transactions.length === 0) {
        throw new Error("Cannot compute Merkle Root: No transactions found.");
    }
    const transactionData = transactions.map(tx => JSON.stringify(tx));
    const merkleTree = new MerkleTree(transactionData);
    this.merkleRoot = merkleTree.getRoot();
};


/**
 * Calculates the hash of the block using SHA-256, based on block properties including the Merkle Root.
 * @returns {string} - The hexadecimal string of the hash.
 */
blockSchema.methods.calculateHash = function() {
    const data = `${this.index}${this.previousHash}${this.timestamp}${this.merkleRoot}${this.nonce}`;
    return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Validates all transactions in the block.
 * @returns {Promise<boolean>} - Resolves to true if all transactions are valid.
 */
blockSchema.methods.hasValidTransactions = async function() {
    const transactions = await this.model('Transaction').find({_id: { $in: this.transactions }});
    for (let transaction of transactions) {
        if (!await transaction.isValid()) {
            return false;
        }
    }
    return true;
};

/**
 * Error handling for save operations.
 */
blockSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        next(new Error('Block with the same index already exists.'));
    } else {
        next(error);
    }
});

const Block = mongoose.model("Block", blockSchema);
module.exports = Block;