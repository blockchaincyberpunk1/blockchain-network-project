/**
 * @file logger.js
 * @description Configures and provides a Winston logger for application-wide logging.
 * Utilizes file and console transports to provide a comprehensive logging solution.
 */

const winston = require("winston");
const path = require("path");

// Define custom levels for logging to differentiate between blockchain-specific logs and general information
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    blockchain: 6,
  },
  colors: {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    verbose: "cyan",
    debug: "blue",
    blockchain: "grey",
  },
};

// Apply the colors to Winston
winston.addColors(customLevels.colors);

/**
 * Creates a Winston logger instance with specified configurations.
 * Logs are categorized and stored in different files based on their level for better organization.
 * In non-production environments, logs are also output to the console with color coding for readability.
 */
const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
    winston.format.errors({ stack: true }), // Captures stack trace in error logs
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: "blockchain-service" },
  transports: [
    // Store all logs of level 'info' and below in 'combined.log'
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/combined.log"),
    }),
    // Store all logs of level 'error' and below in 'error.log'
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/error.log"),
      level: "error",
    }),
    // Store blockchain-specific logs in 'blockchain.log'
    new winston.transports.File({
      filename: path.join(__dirname, "../logs/blockchain.log"),
      level: "blockchain",
    }),
  ],
});

/**
 * In non-production environments, add a transport to log to the console with color coding.
 */
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      level: "debug", // Adjust this level to control what logs are shown in the console
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      ),
    })
  );
}

module.exports = logger;
