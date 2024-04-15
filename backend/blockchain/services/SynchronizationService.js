// Import other necessary services
const BlockchainService = require("./BlockchainService");
const ValidationService = require("./ValidationService");

/**
 * Service responsible for synchronizing the local blockchain with the network.
 */
class SynchronizationService {
  /**
   * Initializes the synchronization service with a reference to the blockchain service.
   * @param {BlockchainService} blockchainService The blockchain service instance.
   */
  constructor(blockchainService) {
    if (
      !blockchainService ||
      !(blockchainService instanceof BlockchainService)
    ) {
      throw new Error("A valid BlockchainService instance is required.");
    }
    this.blockchainService = blockchainService;
  }

  /**
   * Synchronizes the local blockchain with the network.
   * @param {string} networkNodeUrl The URL of a network node to synchronize with.
   * @returns {Promise<void>} A promise that resolves when synchronization is complete.
   */
  async synchronizeChain(networkNodeUrl) {
    try {
      const { default: fetch } = await import("node-fetch");
      const response = await fetch(`${networkNodeUrl}/chain`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch the chain from ${networkNodeUrl}: ${response.statusText}`
        );
      }
      const networkChain = await response.json();

      // Validate the fetched chain before updating the local one
      if (!this.validateNetworkChain(networkChain)) {
        throw new Error(
          "The fetched chain is invalid or not longer than the current chain."
        );
      }

      // Update the local chain with the network chain block by block
      this.updateLocalChain(networkChain);
      console.log(
        "Local blockchain successfully synchronized with the network."
      );
    } catch (error) {
      console.error("Synchronization failed:", error.message);
      if (error.response) {
        console.error("Failed with status code:", error.response.status);
        console.error("Failed with response body:", error.response.statusText);
      }
      throw error; // Re-throw the error to be handled by the caller if necessary
    }
  }

  /**
   * Validates the fetched network chain before synchronization.
   * @param {Array} networkChain The blockchain fetched from the network.
   * @returns {boolean} True if the fetched chain is valid and longer than the local chain, otherwise false.
   */
  validateNetworkChain(networkChain) {
    if (
      !Array.isArray(networkChain) ||
      networkChain.length <= this.blockchainService.getChain().length
    ) {
      return false;
    }

    // Use the ValidationService to validate each block and its transactions in the network chain
    return ValidationService.validateChain(networkChain);
  }

  /**
   * Updates the local blockchain with the blocks from the network chain.
   * This method assumes that the provided network chain is valid and has been
   * properly validated before calling this method.
   * @param {Array} networkChain The validated network blockchain chain.
   */
  updateLocalChain(networkChain) {
    // Reset the current chain to the genesis block
    this.blockchainService.chain = [
      this.blockchainService.createGenesisBlock(),
    ];

    // Iterate through the network chain and add each block
    for (let blockData of networkChain) {
      this.blockchainService.addBlock(blockData);
    }

    console.log("Blockchain successfully updated from the network.");
  }
}

module.exports = SynchronizationService;
