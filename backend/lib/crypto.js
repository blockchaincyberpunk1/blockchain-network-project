/**
 * @fileoverview Provides cryptographic utilities for hashing, digital signature creation, and verification.
 * This module leverages Node.js's built-in crypto library to ensure secure and efficient cryptographic operations.
 */

const crypto = require("crypto");

/**
 * Generates a SHA-256 hash of the given data.
 * This function is used for creating a deterministic and unique hash value from a string input.
 *
 * @param {string} data The data to hash.
 * @returns {string} The SHA-256 hash of the data.
 */
function hashSHA256(data) {
  if (!data) {
    throw new Error("Data is required for hashing");
  }
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Signs a piece of data with a given private key, using the SHA-256 with RSA encryption.
 * This function is critical for generating a digital signature that verifies the integrity and origin of data.
 *
 * @param {string} data The data to be signed.
 * @param {string} privateKey The private key in PEM format.
 * @returns {string} The digital signature in hex format.
 */
function signData(data, privateKey) {
  if (!data || !privateKey) {
    throw new Error("Data and privateKey are required for signing");
  }
  const sign = crypto.createSign("SHA256");
  sign.update(data);
  return sign.sign(privateKey, "hex");
}

/**
 * Verifies a digital signature against a piece of data and a public key.
 * This function confirms whether a signature is valid, ensuring data integrity and authenticity.
 *
 * @param {string} data The data the signature is for.
 * @param {string} publicKey The public key in PEM format.
 * @param {string} signature The digital signature to verify.
 * @returns {boolean} True if the signature is valid and matches the data, false otherwise.
 */
function verifySignature(data, publicKey, signature) {
  if (!data || !publicKey || !signature) {
    throw new Error(
      "Data, publicKey, and signature are required for verification"
    );
  }
  const verify = crypto.createVerify("SHA256");
  verify.update(data);
  return verify.verify(publicKey, signature, "hex");
}

// Example additional utility: Generating Key Pairs
/**
 * Generates a pair of public and private keys using RSA encryption.
 * This utility is essential for creating wallet addresses and signing transactions within the blockchain.
 *
 * @returns {Object} An object containing both the public and private keys in PEM format.
 */
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048, // Standard for RSA keys
    publicKeyEncoding: {
      type: "spki", // Recommended encoding for public keys
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8", // Recommended encoding for private keys
      format: "pem",
    },
  });

  return { publicKey, privateKey };
}

module.exports = {
  hashSHA256,
  signData,
  verifySignature,
  generateKeyPair,
  // Additional exports for new utilities can be listed here.
};
