const mongoose = require("mongoose");

/**
 * Defines the schema for faucet request tracking.
 * This schema is designed to help limit the frequency of requests from individual users
 * by recording their IP addresses and the timestamps of their requests.
 */
const FaucetRequestSchema = new mongoose.Schema({
  /**
   * Stores the IP address of the user making the faucet request.
   * This field is required to uniquely identify users and enforce request limits.
   * @type {String}
   */
  ipAddress: {
    type: String,
    required: true,
    trim: true,
    comment: "IP address of the requester",
  },

  /**
   * Records the date and time when the faucet request was made.
   * Used to calculate the interval between subsequent requests from the same IP address,
   * aiding in the enforcement of request limits.
   * @type {Date}
   * @default Date.now - Sets the default value to the current date and time.
   */
  requestTime: {
    type: Date,
    default: Date.now,
    comment: "Timestamp of the request",
  },
});

/**
 * Creates and exports the FaucetRequest model, which provides an interface to the
 * faucet_requests collection in the MongoDB database, allowing for easy creation,
 * querying, and management of faucet request records.
 */
module.exports = mongoose.model("FaucetRequest", FaucetRequestSchema);
