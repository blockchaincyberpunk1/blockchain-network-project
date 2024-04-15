/**
 * @file Wallet.js
 * @description Manages wallet functionalities including key generation, transaction signing, balance calculations, and signature verification. Enhances security through secure seed derivation and key/address derivation.
 */

const crypto = require("crypto");
const { signData, verifySignature, hashSHA256 } = require("./crypto");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1"); // Using secp256k1 elliptic curve, same as Bitcoin

/**
 * Represents a Wallet in the blockchain network.
 * Provides functionalities for key pair generation, transaction signing, and verification.
 */
class Wallet {
  /**
   * Constructs a Wallet instance. If a private key is provided, the wallet is initialized with it.
   * Otherwise, a new key pair is generated.
   * @param {string} [privateKey] - The private key for an existing wallet.
   */
  constructor(privateKey = "") {
    this.keyPair = privateKey ? ec.keyFromPrivate(privateKey) : ec.genKeyPair();
  }

  /**
   * Generates a new cryptographic key pair for a wallet.
   * @returns {Wallet} A new Wallet instance with a generated key pair.
   */
  static generate() {
    return new Wallet();
  }

  /**
   * Returns the public key of the wallet.
   * @returns {string} The public key in hexadecimal format.
   */
  get publicKey() {
    return this.keyPair.getPublic().encode("hex");
  }

  /**
   * Signs a hash of data with the wallet's private key.
   * @param {string} dataHash - The hash of the data to sign.
   * @returns {string} The signature in hexadecimal format.
   */
  sign(dataHash) {
    if (!dataHash) {
      throw new Error("Data to sign is required");
    }
    const signature = this.keyPair.sign(dataHash);
    return signature.toDER("hex");
  }

  /**
   * Verifies a signature against the hash of data using the wallet's public key.
   * @param {string} dataHash - The hash of the data that was signed.
   * @param {string} signature - The signature in hexadecimal format.
   * @returns {boolean} True if the signature is valid, otherwise false.
   */
  static verifySignature(dataHash, signature, publicKey) {
    if (!dataHash || !signature || !publicKey) {
      throw new Error(
        "Data hash, signature, and public key are required for verification"
      );
    }
    const key = ec.keyFromPublic(publicKey, "hex");
    return key.verify(dataHash, signature);
  }

  /**
   * Utility function to hash data for signing. This is a wrapper around the hashing utility to maintain
   * abstraction within the Wallet class.
   * @param {string} data - The data to hash.
   * @returns {string} The hash of the data.
   */
  static hashData(data) {
    return hashSHA256(data);
  }
}

module.exports = Wallet;
