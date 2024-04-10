/**
 * @file Wallet.js
 * @description Manages wallet functionalities including key generation, transaction signing, balance calculations, and signature verification. Enhances security through secure seed derivation and key/address derivation.
 */

const crypto = require("crypto");
const elliptic = require("elliptic"); // Using Elliptic for ECC
const EC = new elliptic.ec("secp256k1"); // Bitcoin's elliptic curve
const Transaction = require("./Transaction");
const blockchain = require("./Blockchain"); // Assuming this is a reference to your blockchain instance

class Wallet {
  /**
   * Constructs a new Wallet instance with a new key pair or from an existing private key.
   * @param {string} [privateKey] - Optional private key. If provided, the wallet initializes with this key; otherwise, generates a new one.
   */
  constructor(privateKey) {
    this.keyPair = privateKey ? EC.keyFromPrivate(privateKey) : EC.genKeyPair();
    this.publicKey = this.keyPair.getPublic("hex");
  }

  /**
   * Generates a secure random seed and derives a key pair from it.
   * @returns {Object} An object containing the public and private keys.
   */
  static generateSecureKeyPair() {
    const seed = crypto.randomBytes(32); // Secure random seed
    const keyPair = EC.keyFromPrivate(seed); // Deriving key pair from seed
    return {
      publicKey: keyPair.getPublic("hex"),
      privateKey: keyPair.getPrivate("hex"),
    };
  }

  /**
   * Signs a transaction with the wallet's private key.
   * @param {Transaction} transaction - The transaction to sign.
   */
  signTransaction(transaction) {
    if (transaction.fromAddress !== this.publicKey) {
      throw new Error("You cannot sign transactions for other wallets!");
    }
    const hashTx = transaction.calculateHash();
    const sig = this.keyPair.sign(hashTx, "base64");
    transaction.signature = sig.toDER("hex");
  }

  /**
   * Calculates and returns the wallet's balances.
   * @param {Blockchain} blockchain - The blockchain instance to calculate the balance from.
   * @returns {Object} An object containing confirmed, pending, and available balances.
   */
  calculateBalances(blockchain) {
    let confirmedBalance = 0;
    let pendingBalance = 0;

    for (const block of blockchain.chain) {
      for (const transaction of block.transactions) {
        // Check for received transactions
        if (transaction.toAddress === this.publicKey) {
          confirmedBalance += transaction.amount;
        }

        // Check for sent transactions
        if (transaction.fromAddress === this.publicKey) {
          confirmedBalance -= transaction.amount;
        }
      }
    }

    // Iterate through pending transactions
    for (const transaction of blockchain.pendingTransactions) {
      if (transaction.fromAddress === this.publicKey) {
        pendingBalance -= transaction.amount;
      }
    }

    const availableBalance = confirmedBalance - pendingBalance;
    return {
      confirmedBalance,
      pendingBalance,
      availableBalance,
    };
  }

  /**
   * Creates a transaction and signs it.
   * @param {string} toAddress - Recipient's public key/address.
   * @param {number} amount - Amount to send.
   * @returns {Transaction} The signed transaction.
   */
  createTransaction(toAddress, amount) {
    if (!toAddress || amount <= 0) {
      throw new Error(
        "Transaction must include to address and amount greater than 0."
      );
    }

    const transaction = new Transaction(this.publicKey, toAddress, amount);
    this.signTransaction(transaction);
    return transaction;
  }

  /**
   * Static method to create a Wallet instance from a private key.
   * @param {string} privateKey - Private key in hex format.
   * @returns {Wallet} A new Wallet instance.
   */
  static fromPrivateKey(privateKey) {
    return new Wallet(privateKey);
  }
}

module.exports = Wallet;
