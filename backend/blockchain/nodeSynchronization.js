/**
 * @file nodeSynchronization.js
 * @description Handles the synchronization of the blockchain across multiple nodes in the network.
 * Ensures the local node's blockchain is up-to-date with the longest and most valid chain available among peers.
 */

const fetch = require("node-fetch"); // For making HTTP requests to peer nodes
const Blockchain = require("./Blockchain"); // Import your Blockchain class

class NodeSynchronization {
  /**
   * Initializes a new instance of the NodeSynchronization class.
   * @param {Blockchain} blockchain - The local blockchain instance.
   * @param {string[]} peerUrls - An array of URLs for the peer nodes in the network.
   */
  constructor(blockchain, peerUrls) {
    this.blockchain = blockchain;
    this.peerUrls = peerUrls;
  }

  /**
   * Fetches the chains from all peer nodes and updates the local chain to the longest valid chain among them.
   * @returns {Promise<void>} A promise that resolves once the synchronization process is complete.
   */
  async synchronizeChain() {
    const chainPromises = this.peerUrls.map((url) =>
      this.fetchChainFromNode(url)
    );
    const chains = await Promise.all(chainPromises);
    const longestChain = chains.sort((a, b) => b.length - a.length)[0];

    if (
      longestChain &&
      longestChain.length > this.blockchain.chain.length &&
      this.blockchain.isValidChain(longestChain)
    ) {
      console.log("Found a longer valid chain. Updating local blockchain...");
      this.blockchain.replaceChain(longestChain);
    } else {
      console.log(
        "Local blockchain is up-to-date or the longest chain found is not valid."
      );
    }
  }

  /**
   * Fetches the blockchain from a single peer node.
   * @param {string} nodeUrl - The URL of the peer node from which to fetch the blockchain.
   * @returns {Promise<Array>} A promise that resolves with the blockchain chain fetched from the peer node.
   */
  async fetchChainFromNode(nodeUrl) {
    try {
      const response = await fetch(`${nodeUrl}/chain`); // Assuming '/chain' endpoint returns the blockchain
      if (!response.ok) {
        throw new Error(
          `Failed to fetch chain from ${nodeUrl}: ${response.statusText}`
        );
      }
      const { chain } = await response.json();
      return chain;
    } catch (error) {
      console.error(`Error fetching chain from ${nodeUrl}:`, error);
      return [];
    }
  }
}

module.exports = NodeSynchronization;
