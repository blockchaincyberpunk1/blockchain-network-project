const WalletModel = require("../models/WalletModel");
const Wallet = require("../../lib/Wallet");

/**
 * @class WalletService
 * @description Provides high-level wallet operations and business logic,
 * abstracting the underlying wallet model interactions for database persistence.
 */
class WalletService {
  /**
   * Initializes a new wallet, saves it to the database, and returns its public key and other wallet information.
   * @returns {Promise<Object>} An object containing the wallet's public key and other relevant information.
   */
  static async createWallet() {
    try {
      const newWallet = Wallet.generate();
      const walletModel = new WalletModel({
        publicKey: newWallet.publicKey,
        privateKey: newWallet.keyPair.getPrivate("hex"), // Extract private key in hexadecimal format
        balance: 0, // Default balance set to 0
      });
      await walletModel.save();
      return {
        publicKey: walletModel.publicKey,
        privateKey: walletModel.privateKey, // Generally, private key should not be returned, here for completeness
        message: "Wallet created successfully.",
      };
    } catch (error) {
      throw new Error(`Failed to create wallet: ${error.message}`);
    }
  }

  /**
   * Signs data with the given wallet's private key.
   * @param {string} privateKey The private key of the wallet used for signing.
   * @param {string} data The data to sign.
   * @returns {Promise<string>} The signature.
   */
  static async signData(privateKey, data) {
    try {
      const dataHash = Wallet.hashData(data);
      return Wallet.signData(dataHash, privateKey);
    } catch (error) {
      throw new Error(`Failed to sign data: ${error.message}`);
    }
  }

  /**
   * Verifies the signature of data signed by a wallet's public key.
   * @param {string} publicKey The public key of the wallet that was used to sign the data.
   * @param {string} signature The signature to verify.
   * @param {string} data The original data that was signed.
   * @returns {Promise<boolean>} True if the signature is valid, false otherwise.
   */
  static async verifySignature(publicKey, signature, data) {
    try {
      const dataHash = Wallet.hashData(data);
      return Wallet.verifySignature(dataHash, signature, publicKey);
    } catch (error) {
      throw new Error(`Failed to verify signature: ${error.message}`);
    }
  }

  /**
   * Utility method to hash data using the Wallet's hashing functionality.
   * @param {string} data The data to hash.
   * @returns {Promise<string>} The hash of the data.
   */
  static async hashData(data) {
    try {
      return Wallet.hashData(data);
    } catch (error) {
      throw new Error(`Failed to hash data: ${error.message}`);
    }
  }
}

module.exports = WalletService;
