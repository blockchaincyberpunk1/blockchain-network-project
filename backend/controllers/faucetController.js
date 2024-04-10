/**
 * @file faucetController.js
 * @description Enhanced controller for the faucet functionality, incorporating improved validation, dynamic rate-limiting, and abuse prevention.
 */

const FaucetRequest = require("../models/FaucetRequest");
const Wallet = require("../lib/Wallet");
const Transaction = require("../models/Transaction");
const Blockchain = require("../blockchain/Blockchain");
const blockchain = new Blockchain();
const { isValidAddress } = require("../utils/addressValidator"); // Placeholder for actual utility function
const captchaValidator = require("../utils/captchaValidator"); // Placeholder for captcha validation utility

// Configuration variables
const FAUCET_PAYOUT_BASE = 100; // Base payout amount, can be adjusted dynamically
const REQUEST_LIMIT_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Validates the request for coins from the faucet. Includes checks for address format, rate limiting, and captcha verification.
 * @param {string} recipientAddress The recipient's blockchain address.
 * @param {string} ipAddress The user's IP address.
 * @param {string} captchaResponse The user's response to the captcha challenge.
 * @returns {Promise<string|true>} True if valid, otherwise an error message.
 */
async function validateFaucetRequest(
  recipientAddress,
  ipAddress,
  captchaResponse
) {
  if (!recipientAddress || !isValidAddress(recipientAddress)) {
    throw new Error("Invalid or missing recipient address.");
  }

  if (!(await captchaValidator.verifyResponse(captchaResponse))) {
    throw new Error("Invalid captcha response.");
  }

  const lastRequest = await FaucetRequest.findOne({
    ipAddress,
    recipientAddress,
  }).sort({ createdAt: -1 });
  if (
    lastRequest &&
    new Date() - new Date(lastRequest.createdAt) < REQUEST_LIMIT_TIME
  ) {
    throw new Error(
      "Request limit exceeded. Please wait before requesting again."
    );
  }

  return true;
}

/**
 * Handles coin/token requests from the faucet with rate-limiting, captcha verification, and validation.
 * @param {Object} req The request object, containing the recipient's address and captcha response.
 * @param {Object} res The response object for sending responses to the client.
 */
exports.requestCoins = async (req, res) => {
  const { recipientAddress, captchaResponse } = req.body;
  const ipAddress = req.ip;

  try {
    await validateFaucetRequest(recipientAddress, ipAddress, captchaResponse);

    const faucetWallet = new Wallet(process.env.FAUCET_PRIVATE_KEY);
    const transaction = new Transaction(
      faucetWallet.publicKey,
      recipientAddress,
      FAUCET_PAYOUT_BASE
    );
    transaction.signTransaction(faucetWallet.privateKey); // Assuming the method signature is (privateKey)
    blockchain.addTransaction(transaction);

    await FaucetRequest.create({
      ipAddress,
      recipientAddress,
      amount: FAUCET_PAYOUT_BASE,
      transactionId: transaction.id,
    });

    res.json({
      message: `Successfully requested ${FAUCET_PAYOUT_BASE} coins. Transaction is pending confirmation.`,
      transactionId: transaction.id,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
