const ExplorerService = require("../services/ExplorerService");
const BlockchainService = require("../../blockchain/services/BlockchainService");

// Initialize services
const blockchainService = new BlockchainService();
const explorerService = new ExplorerService(blockchainService);

/**
 * Controller for blockchain explorer functionalities. This class handles API requests related to blockchain data retrieval,
 * including entire blockchain, specific blocks, transactions by address, and balance queries.
 */
class ExplorerController {
  /**
   * Retrieves the entire blockchain.
   * @param {Request} req - The HTTP request object from Express.
   * @param {Response} res - The HTTP response object from Express.
   */
  static async getBlockchain(req, res) {
    try {
      const chain = await explorerService.getBlockchain(); // Assuming getBlockchain is an async function
      res.json({ success: true, chain });
    } catch (error) {
      console.error(`Error retrieving blockchain: ${error.message}`);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to retrieve blockchain data.",
        });
    }
  }

  /**
   * Retrieves a specific block by its index in the blockchain.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  static async getBlockByIndex(req, res) {
    try {
      const index = parseInt(req.params.index, 10);
      const block = await explorerService.getBlockByIndex(index); // Assuming getBlockByIndex is an async function

      if (!block) {
        return res
          .status(404)
          .json({ success: false, message: "Block not found." });
      }

      res.json({ success: true, block });
    } catch (error) {
      console.error(`Error retrieving block: ${error.message}`);
      res
        .status(500)
        .json({ success: false, message: "Failed to retrieve block data." });
    }
  }

  /**
   * Retrieves all transactions associated with a specific blockchain address.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  static async getTransactionsForAddress(req, res) {
    try {
      const address = req.params.address;
      const transactions = await explorerService.getTransactionsForAddress(
        address
      ); // Assuming this is an async function

      if (!transactions.length) {
        return res
          .status(404)
          .json({
            success: false,
            message: "No transactions found for this address.",
          });
      }

      res.json({ success: true, transactions });
    } catch (error) {
      console.error(`Error retrieving transactions: ${error.message}`);
      res
        .status(500)
        .json({ success: false, message: "Failed to retrieve transactions." });
    }
  }

  /**
   * Retrieves the balance of a given blockchain address.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  static async getAddressBalance(req, res) {
    try {
      const address = req.params.address;
      const balance = await explorerService.getAddressBalance(address); // Assuming getAddressBalance is an async function

      if (balance === undefined) {
        return res
          .status(404)
          .json({ success: false, message: "Address not found." });
      }

      res.json({ success: true, balance });
    } catch (error) {
      console.error(`Error retrieving address balance: ${error.message}`);
      res
        .status(500)
        .json({
          success: false,
          message: "Failed to retrieve address balance.",
        });
    }
  }
}

module.exports = ExplorerController;
