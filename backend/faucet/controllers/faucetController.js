const FaucetService = require("../services/FaucetService");
const BlockchainService = require("../../blockchain/services/BlockchainService");
const WalletService = require("../../wallet/services/WalletService");

/**
 * Assuming instances of BlockchainService and WalletService are initialized elsewhere and
 * are injected into the FaucetService, which this controller will utilize.
 */
const blockchainService = new BlockchainService();
const walletService = new WalletService();

// Initialize the FaucetService with the required services
const faucetService = new FaucetService(blockchainService, walletService);

/**
 * Controller class for handling faucet-related requests to distribute tokens.
 */
class FaucetController {
  /**
   * Handles a request to send tokens to a specified blockchain address.
   * Validates input, processes the request via FaucetService, and handles responses.
   *
   * @param {Request} req - The request object from Express.js containing the recipient's address and amount.
   * @param {Response} res - The response object from Express.js used to send back the HTTP response.
   */
  static async sendTokens(req, res) {
    try {
      const { recipientAddress, amount } = req.body;

      // Validate recipient address
      if (!recipientAddress) {
        return res.status(400).json({ error: "Recipient address is required." });
      }

      // Validate amount
      if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ error: "A valid amount is required." });
      }

      // Call the FaucetService to process the token sending
      const result = await faucetService.sendTokens(recipientAddress, amount);

      // Success response with the transaction details
      res.status(200).json({
        message: "Tokens sent successfully.",
        transaction: result.transaction,
      });
    } catch (error) {
      // Log internal server errors and send a 500 response
      console.error(`Faucet Error: ${error.message}`);
      res.status(500).json({ error: "Failed to send tokens due to an internal error." });
    }
  }
}

module.exports = FaucetController;

