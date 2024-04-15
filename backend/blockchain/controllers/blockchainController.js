const BlockchainService = require("../services/BlockchainService");
const MiningService = require("../services/MiningService");
const ValidationService = require("../services/ValidationService");

/**
 * @class BlockchainController
 * @description Manages API interactions for blockchain operations including transactions,
 * block mining, and querying blockchain status, ensuring robust handling of request and response cycles.
 */
class BlockchainController {
  /**
   * Initializes blockchain and mining services.
   */
  constructor() {
    this.blockchainService = new BlockchainService();
    this.miningService = new MiningService(this.blockchainService);
  }

  /**
   * Creates a new transaction based on the request data, validates it, and adds it to the blockchain.
   * @param {Request} req - The HTTP request object, containing transaction details.
   * @param {Response} res - The HTTP response object.
   */
  async createTransaction(req, res) {
    const { fromAddress, toAddress, amount, privateKey } = req.body;
    try {
      if (
        !ValidationService.validateTransaction(
          fromAddress,
          toAddress,
          amount,
          privateKey
        )
      ) {
        return res.status(400).send("Incomplete or invalid transaction data.");
      }

      const transaction = await this.blockchainService.createTransaction(
        fromAddress,
        toAddress,
        amount,
        privateKey
      );
      if (!transaction) {
        throw new Error("Transaction creation failed.");
      }

      await this.blockchainService.addTransaction(transaction);
      res
        .status(201)
        .json({ message: "Transaction successfully added.", transaction });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Error creating transaction: ${error.message}` });
    }
  }

  /**
   * Mines pending transactions and rewards the miner with a new block.
   * @param {Request} req - The HTTP request object, containing the miner's reward address.
   * @param {Response} res - The HTTP response object.
   */
  async minePendingTransactions(req, res) {
    try {
      const { rewardAddress } = req.body;
      if (!rewardAddress) {
        console.error("No reward address provided");
        return res.status(400).send("Reward address is required.");
      }

      await this.miningService.mineBlock(rewardAddress);
      console.log("Mining successful");
      res.json({
        message: "Block successfully mined and added to the blockchain.",
      });
    } catch (error) {
      console.error("Mining failed:", error);
      res
        .status(500)
        .json({ message: `Failed to mine block: ${error.message}` });
    }
  }

  /**
   * Retrieves the entire blockchain.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  getBlockchain(req, res) {
    try {
      const chain = this.blockchainService.getChain();
      res.json(chain);
    } catch (error) {
      res
        .status(500)
        .json({ message: `Failed to retrieve blockchain: ${error.message}` });
    }
  }

  /**
   * Validates the entire blockchain to ensure its integrity.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  validateChain(req, res) {
    try {
      const isValid = this.blockchainService.isChainValid();
      res.json({
        message: isValid
          ? "Blockchain is valid."
          : "Blockchain validation failed.",
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Blockchain validation error: ${error.message}` });
    }
  }

  /**
   * Retrieves the balance of a specific blockchain address.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  getBalanceOfAddress(req, res) {
    try {
      const { address } = req.params;
      if (!ValidationService.validateAddress(address)) {
        return res.status(400).json({ message: "Invalid address." });
      }

      const balance = this.blockchainService.getBalanceOfAddress(address);
      res.json({ balance });
    } catch (error) {
      res
        .status(500)
        .json({ message: `Failed to retrieve balance: ${error.message}` });
    }
  }
}

module.exports = new BlockchainController();
