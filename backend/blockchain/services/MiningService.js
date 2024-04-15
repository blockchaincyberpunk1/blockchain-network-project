const BlockchainService = require("./BlockchainService");

/**
 * @class MiningService
 * @description Handles the operations related to mining blocks within a blockchain.
 * Ensures that mining only occurs when valid and ensures interactions are compliant with updated blockchain validation rules.
 */
class MiningService {
  /**
   * Constructs the mining service and injects the blockchain service dependency.
   * @param {BlockchainService} blockchainService - The blockchain service instance used for accessing blockchain operations.
   * @throws {Error} If the provided service is not an instance of BlockchainService.
   */
  constructor(blockchainService) {
    if (
      !blockchainService ||
      !(blockchainService instanceof BlockchainService)
    ) {
      throw new Error("Invalid BlockchainService provided.");
    }
    this.blockchainService = blockchainService;
  }

  /**
   * Mines a new block with the pending transactions and applies the reward to the specified address.
   * @param {string} miningRewardAddress - The address that will receive the mining reward.
   * @throws {Error} If the mining reward address is invalid or if the mining process fails.
   */
  async mineBlock(miningRewardAddress) {
    if (
      typeof miningRewardAddress !== "string" ||
      miningRewardAddress.trim() === ""
    ) {
      throw new Error("Invalid mining reward address.");
    }

    try {
      await this.blockchainService.minePendingTransactions(miningRewardAddress);
      console.log("Mining successful. New block added to the blockchain.");
    } catch (error) {
      console.error("Mining failed:", error.message);
      throw new Error("Failed to mine new block: " + error.message);
    }
  }

  /**
   * Adjusts the mining difficulty based on the time taken to mine the last block.
   * This is to ensure that block generation time remains consistent despite varying network loads.
   * @param {number} blockTime - The time taken (in milliseconds) to mine the previous block.
   */
  adjustDifficulty(blockTime) {
    const currentDifficulty = this.blockchainService.difficulty;
    const newDifficulty =
      blockTime < 2000 ? currentDifficulty + 1 : currentDifficulty - 1;
    this.blockchainService.difficulty = Math.max(1, newDifficulty);
    console.log(
      `Mining difficulty adjusted to ${this.blockchainService.difficulty}.`
    );
  }
}

module.exports = MiningService;
