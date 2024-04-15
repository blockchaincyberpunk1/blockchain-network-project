/**
 * @fileoverview Implements Merkle Tree for efficient transaction integrity verification within a blockchain network.
 * Utilizes cryptographic hashing for constructing a tree where every leaf is a hash of transaction data,
 * and every non-leaf node is a hash of its child nodes. Provides functionalities for generating Merkle proofs
 * and verifying transactions against the Merkle root, enabling a compact and secure means of verifying transaction
 * data integrity without needing the entire transaction list.
 */

const { hashSHA256 } = require("./crypto");

/**
 * Class representing a Merkle Tree. Merkle Trees are a fundamental component of blockchain technology,
 * allowing for efficient and secure verification of content in a large body of data.
 */
class MerkleTree {
  /**
   * Initializes a Merkle Tree with a list of transactions. It checks if the input is an array and is not empty.
   * @param {string[]} transactions - An array of transaction data to be included in the Merkle Tree.
   * @throws {Error} If the transactions input is not an array or is empty.
   */
  constructor(transactions) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      console.error("Invalid transactions array provided to Merkle Tree.");
      throw new Error("Transactions must be an array and cannot be empty.");
    }
    this.leaves = transactions.map(hashSHA256);
    this.tree = this.buildTree(this.leaves);
  }

  /**
   * Builds the Merkle Tree using the transaction hashes. This method is recursive and constructs new tree levels
   * until only one hash remains, the root.
   * @param {string[]} hashes - Transaction hashes to build the tree with.
   * @returns {string[]} The complete Merkle Tree array, culminating in the root hash.
   */
  buildTree(hashes) {
    if (hashes.length === 1) {
      return hashes;
    }

    const newLevel = [];
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || left; // Handles an odd number of hashes by duplicating the last hash
      newLevel.push(hashSHA256(left + right));
    }

    return this.buildTree(newLevel);
  }

  /**
   * Retrieves the root hash of the Merkle Tree, which represents the top-level hash of all combined transactions.
   * @returns {string} The root hash of the Merkle Tree.
   */
  getRoot() {
    return this.tree[this.tree.length - 1];
  }

  /**
   * Generates a Merkle proof for a given transaction, which is a series of hashes required to reconstruct the root hash for verification.
   * @param {string} transaction - The transaction data to generate a proof for.
   * @returns {string[]} The Merkle proof for the transaction, an array of hashes.
   * @throws {Error} If the transaction is not found in the leaves of the tree.
   */
  generateProof(transaction) {
    const hash = hashSHA256(transaction);
    let index = this.leaves.indexOf(hash);
    if (index === -1) {
      throw new Error("Transaction not found in the Merkle Tree.");
    }

    const proof = [];
    let siblingIndex;

    for (
      let level = this.leaves;
      level.length > 1;
      level = this.buildTree(level)
    ) {
      siblingIndex = index % 2 === 0 ? index + 1 : index - 1;
      // Ensure sibling index is in bounds
      siblingIndex = siblingIndex < level.length ? siblingIndex : index;
      proof.push(level[siblingIndex]);
      // Move up the tree
      index = Math.floor(index / 2);
    }

    return proof;
  }

  /**
   * Verifies a transaction against a Merkle proof and the root. It reconstructs the root using the provided proof and compares it.
   * @param {string[]} proof - The Merkle proof for the transaction.
   * @param {string} root - The root hash of the Merkle Tree.
   * @param {string} transaction - The transaction data to verify.
   * @returns {boolean} True if the proof is valid and the transaction is part of the tree, false otherwise.
   */
  static verifyProof(proof, root, transaction) {
    let computedHash = hashSHA256(transaction);

    proof.forEach((siblingHash) => {
      const isLeft = computedHash < siblingHash;
      computedHash = hashSHA256(
        isLeft ? computedHash + siblingHash : siblingHash + computedHash
      );
    });

    return computedHash === root;
  }
}

module.exports = MerkleTree;
