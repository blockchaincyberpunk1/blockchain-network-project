/**
 * @file FaucetModel.js
 * @description Defines the MongoDB model for faucet transactions in the blockchain network. This model helps in managing and limiting the number of requests a user can make to the faucet.
 */

const mongoose = require("mongoose");

// Define the faucet transaction schema
const faucetSchema = new mongoose.Schema(
  {
    recipientAddress: {
      type: String,
      required: [true, "Recipient address is required"],
      validate: {
        validator: function (address) {
          // Placeholder for address validation logic
          return /^0x[a-fA-F0-9]{40}$/.test(address);
        },
        message: (props) => `${props.value} is not a valid wallet address!`,
      },
    },
    amount: {
      type: Number,
      required: [true, "Amount of tokens is required"],
      min: [1, "Minimum amount of tokens must be at least 1"],
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to handle errors during save operations
faucetSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("Duplicate entry for the faucet transaction."));
  } else if (error.name === "ValidationError") {
    let messages = Object.values(error.errors).map((val) => val.message);
    next(new Error(messages.join(", ")));
  } else {
    next(); // If no errors, move to the next middleware
  }
});

// Create the model from the schema
const Faucet = mongoose.model("Faucet", faucetSchema);

module.exports = Faucet;
