/**
 * @fileoverview Implements Merkle Tree for efficient transaction integrity verification within a blockchain network.
 * Utilizes cryptographic hashing for constructing a tree where every leaf is a hash of transaction data,
 * and every non-leaf node is a hash of its child nodes. Provides functionalities for generating Merkle proofs
 * and verifying transactions against the Merkle root, enabling a compact and secure means of verifying transaction
 * data integrity without needing the entire transaction list.
 */

const crypto = require("crypto");

/**
 * Hashes input data using SHA-256, a cryptographic hash function offering a good balance of speed and security.
 * @param {string} data - The data to hash.
 * @returns {string} The SHA-256 hash of the data.
 */
function hashData(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

/**
 * Class representing a Merkle Tree. Merkle Trees are a fundamental component of blockchain technology,
 * allowing for efficient and secure verification of content in a large body of data.
 */
class MerkleTree {
  /**
   * Initializes a new Merkle Tree with a given list of transactions. Transactions are hashed
   * to form the leaves of the tree.
   * @param {Object[]} transactions - The transactions to include in the Merkle Tree. Each transaction is expected
   * to be an object that can be stringified.
   */
  constructor(transactions) {
    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new Error(
        "A non-empty array of transactions is required to construct a Merkle Tree"
      );
    }
    this.transactions = transactions.map((transaction) =>
      hashData(JSON.stringify(transaction))
    );
    this.tree = this.buildTree(this.transactions);
  }

  /**
   * Builds the Merkle Tree from the initial list of hashed transactions. The process involves
   * pairwise hashing of the leaves and intermediate nodes until a single hash (the Merkle root) is obtained.
   * @param {string[]} hashedTransactions - An array of hashed transaction strings.
   * @returns {string[]} The constructed Merkle Tree, stored as an array with the root at the last index.
   */
  buildTree(hashedTransactions) {
    let layer = hashedTransactions;
    while (layer.length > 1) {
      layer = this.getNextLayer(layer);
    }
    return layer; // The final layer is the root.
  }

  /**
   * Computes the next layer of the tree by pairwise hashing the nodes of the current layer.
   * If the layer has an odd number of nodes, the last node is duplicated and hashed with itself.
   * @param {string[]} currentLayer - The current layer being processed.
   * @returns {string[]} The next layer in the tree.
   */
  getNextLayer(currentLayer) {
    const nextLayer = [];
    for (let i = 0; i < currentLayer.length; i += 2) {
      const left = currentLayer[i];
      const right = i + 1 < currentLayer.length ? currentLayer[i + 1] : left; // Duplicate last node if odd number of nodes.
      nextLayer.push(hashData(left + right));
    }
    return nextLayer;
  }

  /**
   * Retrieves the Merkle Root from the tree, which is the single hash at the final layer
   * and serves as a concise representation of all transactions.
   * @returns {string} The Merkle Root of the tree.
   */
  getRoot() {
    return this.tree[0];
  }

  /**
   * Generates a Merkle Proof for a specific transaction. A Merkle Proof consists of a series of hashes
   * that can be used to verify that a particular transaction is included in the Merkle Tree without needing
   * the entire tree.
   * @param {Object} transaction - The transaction for which to generate the proof.
   * @returns {string[]|null} An array representing the Merkle Proof, or null if the transaction is not found.
   */
  generateProof(transaction) {
    let index = this.transactions.indexOf(
      hashData(JSON.stringify(transaction))
    );
    if (index === -1) {
      return null; // Transaction not found.
    }

    let proof = [];
    let layer = this.transactions;
    while (layer.length > 1) {
      const isRightNode = index % 2;
      const siblingIndex = isRightNode ? index - 1 : index + 1;
      if (siblingIndex < layer.length) {
        proof.push(layer[siblingIndex]);
      }
      layer = this.getNextLayer(layer);
      index = Math.floor(index / 2);
    }
    return proof;
  }

  /**
   * Verifies a transaction against the Merkle Tree using a Merkle Proof. This method is static
   * as it does not rely on an instance of the Merkle Tree and can be used to verify a proof against
   * a known root.
   * @param {string[]} proof - The Merkle Proof array, consisting of hashes that were sibling nodes
   * in the path from the transaction leaf to the root.
   * @param {string} root - The known Merkle Root to verify against.
   * @param {Object} transaction - The transaction to verify.
   * @returns {boolean} True if the proof is valid and the transaction is part of the tree, false otherwise.
   */
  static verifyProof(proof, root, transaction) {
    let hash = hashData(JSON.stringify(transaction));
    for (const siblingHash of proof) {
      const isLeftNode = hash < siblingHash; // Determine the order for hashing based on the current hash and sibling hash.
      hash = hashData(isLeftNode ? hash + siblingHash : siblingHash + hash);
    }
    return hash === root;
  }
}

module.exports = MerkleTree;
