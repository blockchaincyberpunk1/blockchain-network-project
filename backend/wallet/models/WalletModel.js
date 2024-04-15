/**
 * @file WalletModel.js
 * @description Defines the MongoDB model for wallets in the blockchain network.
 * Wallets store cryptographic keys and manage transactions.
 */

const mongoose = require("mongoose");
const Wallet = require("../../lib/Wallet");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1"); // Using secp256k1 elliptic curve, same as Bitcoin

/**
 * Wallet schema for MongoDB using Mongoose.
 * @type {mongoose.Schema}
 */
const walletSchema = new mongoose.Schema({
  publicKey: {
    type: String,
    required: [true, "Public key is required"],
    unique: true,
    validate: {
      /**
       * Validator that checks if a provided public key is correctly formatted.
       * @param {string} v - The public key in hexadecimal format.
       * @returns {boolean} True if the format is valid, otherwise false.
       */
      validator: function(v) {
        try {
          const testKey = ec.keyFromPublic(v, "hex");
          return Boolean(testKey.getPublic()); // If no error, return true
        } catch (e) {
          return false; // Any error in key creation means invalid format
        }
      },
      message: "Invalid public key format"
    },
  },
  privateKey: {
    type: String,
    required: [true, "Private key is required"],
    validate: {
      /**
       * Validator that checks if the private key can generate a valid public key and sign transactions.
       * @param {string} v - The private key in hexadecimal format.
       * @returns {boolean} True if the private key is valid, otherwise false.
       */
      validator: function(v) {
        try {
          const tempWallet = new Wallet(v);
          const dataHash = Wallet.hashData("test");
          const signature = tempWallet.sign(dataHash);
          return Wallet.verifySignature(dataHash, signature, tempWallet.publicKey);
        } catch (e) {
          return false;
        }
      },
      message: "Invalid private key format"
    },
  },
  balance: {
    type: Number,
    default: 0,
    validate: {
      /**
       * Validator that ensures the wallet balance is non-negative.
       * @param {number} value - The balance of the wallet.
       * @returns {boolean} True if the balance is non-negative, otherwise false.
       */
      validator: function (value) {
        return value >= 0;
      },
      message: props => `Balance cannot be negative: ${props.value}`,
    },
  },
}, {
  timestamps: true,
});

/**
 * Middleware for handling MongoDB errors, especially for unique constraint on the public key.
 */
walletSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("A wallet with this public key already exists."));
  } else if (error.name === "ValidationError") {
    const messages = Object.values(error.errors).map(val => val.message);
    next(new Error(messages.join(", ")));
  } else {
    next(); // Pass to the next middleware
  }
});

// Create and export the Wallet model from the schema
const WalletModel = mongoose.model("Wallet", walletSchema);

module.exports = WalletModel;
