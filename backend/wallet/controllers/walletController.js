const WalletService = require("../services/WalletService");

/**
 * Controller for wallet operations, handling HTTP requests and responses.
 */
class WalletController {
  /**
   * Creates a new wallet and returns the public key.
   * @param {Request} req - The request object from Express.
   * @param {Response} res - The response object from Express.
   */
  static async createWallet(req, res) {
    try {
      const walletInfo = await WalletService.createWallet();
      res.json({
        success: true,
        ...walletInfo,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Error creating wallet: ${error.message}`,
      });
    }
  }

  /**
   * Signs data with a private key and returns the signature.
   * @param {Request} req - The request object from Express.
   * @param {Response} res - The response object from Express.
   */
  static async signData(req, res) {
    const { privateKey, data } = req.body;
    if (!privateKey || !data) {
      return res.status(400).json({
        success: false,
        message: "Private key and data are required.",
      });
    }

    try {
      const signature = await WalletService.signData(privateKey, data);
      res.json({
        success: true,
        signature,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Error signing data: ${error.message}`,
      });
    }
  }

  /**
   * Verifies a signature against the provided data and public key.
   * @param {Request} req - The request object from Express.
   * @param {Response} res - The response object from Express.
   */
  static async verifySignature(req, res) {
    const { publicKey, signature, data } = req.body;
    if (!publicKey || !signature || !data) {
      return res.status(400).json({
        success: false,
        message: "Public key, signature, and data are required.",
      });
    }

    try {
      const isValid = await WalletService.verifySignature(
        publicKey,
        signature,
        data
      );
      res.json({
        success: true,
        isValid,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: `Error verifying signature: ${error.message}`,
      });
    }
  }
}

module.exports = WalletController;
