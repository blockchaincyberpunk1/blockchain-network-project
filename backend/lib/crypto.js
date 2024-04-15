/**
 * @fileoverview Provides cryptographic utilities for hashing, digital signature creation, and verification.
 * This module leverages Node.js's built-in crypto library to ensure secure and efficient cryptographic operations.
 */

const crypto = require("crypto");

/**
 * Generates a SHA-256 hash of the given data.
 * @param {string} data - Data to hash.
 * @returns {string} - Hexadecimal representation of the hash.
 */
function hashSHA256(data) {
    if (typeof data !== 'string') {
        throw new TypeError('Data must be a string.');
    }
    return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Signs data with a given private key.
 * @param {string} data - Data to sign.
 * @param {string} privateKey - Private key in PEM format.
 * @returns {string} - Signature in hex format.
 */
function signData(data, privateKey) {
    if (typeof data !== 'string' || typeof privateKey !== 'string') {
        throw new TypeError('Data and privateKey must be strings.');
    }
    const sign = crypto.createSign("SHA256");
    sign.update(data);
    return sign.sign(privateKey, "hex");
}

/**
 * Verifies a digital signature.
 * @param {string} data - Data the signature is for.
 * @param {string} publicKey - Public key in PEM format.
 * @param {string} signature - Signature to verify, in hex format.
 * @returns {boolean} - True if the signature is valid, false otherwise.
 */
function verifySignature(data, publicKey, signature) {
    if (typeof data !== 'string' || typeof publicKey !== 'string' || typeof signature !== 'string') {
        throw new TypeError('Data, publicKey, and signature must be strings.');
    }
    const verify = crypto.createVerify("SHA256");
    verify.update(data);
    return verify.verify(publicKey, signature, "hex");
}

module.exports = {
    hashSHA256,
    signData,
    verifySignature,
};