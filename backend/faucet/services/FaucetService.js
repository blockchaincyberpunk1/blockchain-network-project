const BlockchainService = require("../../blockchain/services/BlockchainService");
const WalletService = require("../../wallet/services/WalletService");
const TransactionModel = require("../../blockchain/models/TransactionModel"); // Assuming you have a model for Transactions

/**
 * @class FaucetService
 * @description Service providing faucet functionalities to send tokens to users for testing purposes.
 */
class FaucetService {
  /**
   * Initializes the FaucetService with dependencies on BlockchainService and WalletService.
   * @param {BlockchainService} blockchainService An instance of BlockchainService.
   * @param {WalletService} walletService An instance of WalletService.
   */
  constructor(blockchainService, walletService) {
    this.blockchainService = blockchainService;
    this.walletService = walletService;
  }

  /**
   * Sends testing tokens to a requested wallet address.
   * @param {string} recipientAddress The public address of the recipient's wallet.
   * @param {number} amount The amount of tokens to send.
   * @returns {Promise<Object>} A promise that resolves to an object containing the transaction details.
   * @throws {Error} Throws an error if recipient address is missing, amount is invalid, or if insufficient funds.
   */
  async sendTokens(recipientAddress, amount) {
    if (!recipientAddress) {
      throw new Error("Recipient address is required.");
    }
    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("Invalid amount specified.");
    }

    // Assume the faucet has a predefined wallet from which it sends tokens
    const faucetPrivateKey = process.env.FAUCET_PRIVATE_KEY; // This should be securely stored
    const faucetPublicKey = await this.walletService.getPublicKeyFromPrivateKey(
      faucetPrivateKey
    );

    // Verify if the faucet has enough balance
    const faucetBalance = await this.blockchainService.getBalanceOfAddress(
      faucetPublicKey
    );
    if (faucetBalance < amount) {
      throw new Error("Insufficient faucet balance.");
    }

    // Create and sign a transaction from the faucet to the recipient
    const transaction = new TransactionModel({
      fromAddress: faucetPublicKey,
      toAddress: recipientAddress,
      amount: amount,
    });
    transaction.signTransaction(faucetPrivateKey);

    // Save transaction to the database
    await transaction.save();

    // Add the transaction to the blockchain
    await this.blockchainService.addTransaction(transaction);

    // Mine the transaction to include it in the blockchain
    await this.blockchainService.minePendingTransactions(faucetPublicKey);

    return {
      message: "Tokens sent successfully.",
      transaction: transaction,
    };
  }
}

module.exports = FaucetService;
