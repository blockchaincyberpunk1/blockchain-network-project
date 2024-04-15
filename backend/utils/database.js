/**
 * @file database.js
 * @description Utility for managing MongoDB connections.
 */

const mongoose = require("mongoose");
const logger = require("../lib/logger"); // Ensure you have a logger utility.

/**
 * Connects to MongoDB using Mongoose.
 * The MongoDB URL is stored in an environment variable for security.
 */
function connectDatabase() {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    logger.error('MongoDB URI is not set in environment variables.');
    process.exit(1); // Stop the process if the URI is not set
  }

  mongoose.connect(dbUri)
    .then(() => logger.info('Connected to MongoDB'))
    .catch(err => logger.error('Could not connect to MongoDB:', err));

  // Connection events
  mongoose.connection.on("connected", () => {
    logger.info("Mongoose connected to the db.");
  });

  mongoose.connection.on("error", (err) => {
    logger.error("Mongoose connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    logger.info("Mongoose disconnected.");
  });

  mongoose.connection.on("reconnected", function () {
    logger.info("MongoDB reconnected!");
  });

  // Close the Mongoose connection, when receiving SIGINT
  process.on("SIGINT", function () {
    mongoose.connection.close(function () {
      logger.info("Mongoose connection disconnected through app termination.");
      process.exit(0);
    });
  });
}

module.exports = { connectDatabase };
