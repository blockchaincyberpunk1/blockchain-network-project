const SynchronizationService = require("../services/SynchronizationService");
const Node = require("../models/NodeModel");

/**
 * @class NodeController
 * @description Handles node-related operations within the blockchain network, including registration and synchronization.
 */
class NodeController {
  /**
   * Initializes the NodeController with necessary services.
   * @param {SynchronizationService} synchronizationService - The synchronization service instance.
   */
  constructor(synchronizationService) {
    this.synchronizationService = synchronizationService;
    this.nodes = []; // This could also utilize a database for persistence.
  }

  /**
   * Registers a new node within the network if it's not already registered and is valid.
   * @param {string} nodeUrl - The URL of the node to register.
   * @returns {Node} The registered node object.
   * @throws {Error} Throws an error if the node is invalid or already exists.
   */
  registerNode(nodeUrl) {
    // Create a new Node with an object that contains the 'url' key
    const node = new Node({ url: nodeUrl });
    if (!node.validate()) {
      throw new Error("Invalid node URL.");
    }

    const isNodeExist = this.nodes.some((n) => n.url === node.url);
    if (isNodeExist) {
      throw new Error("Node already exists.");
    }

    this.nodes.push(node);
    console.log(`Node registered successfully: ${nodeUrl}`);
    return node;
  }

  /**
   * Lists all registered nodes in the network.
   * @returns {Node[]} An array of registered nodes.
   */
  listNodes() {
    return this.nodes;
  }

  /**
   * Initiates synchronization of the local blockchain with another node in the network.
   * @param {string} nodeUrl - The URL of the target node for synchronization.
   * @returns {Promise<void>} A promise that resolves when synchronization is complete or throws an error if failed.
   */
  async synchronizeWithNode(nodeUrl) {
    console.log(`Attempting to synchronize with node: ${nodeUrl}`);
    try {
      await this.synchronizationService.synchronizeChain(nodeUrl);
      console.log("Synchronization successful.");
    } catch (error) {
      console.error(`Synchronization failed: ${error.message}`);
      throw new Error(`Failed to synchronize with node: ${error.message}`);
    }
  }
}

module.exports = NodeController;
