/**
 * @file app.js
 * @description Initializes an Express server with integrated middleware, handles routes for a blockchain application,
 * and establishes a MongoDB connection using Mongoose. This setup includes logging with Morgan and handles real-time
 * interactions with Socket.IO.
 */

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Import database utility
const { connectDatabase } = require("./utils/database");

// Middleware imports
const { generalRateLimiter, rateLimitErrorHandler } = require("./middleware/authMiddleware");
const { errorMiddleware } = require("./middleware/errorMiddleware");
// Route imports
const blockchainRoutes = require("./blockchain/routes/blockchainRoutes");
const walletRoutes = require("./wallet/routes/walletRoutes");
const faucetRoutes = require("./faucet/routes/faucetRoutes");
const explorerRoutes = require("./explorer/routes/explorerRoutes");
const transactionRoutes = require("./blockchain/routes/transactionRoutes");
const nodeRoutes = require("./blockchain/routes/nodeRoutes");

// Get the node identifier from the command line arguments
const nodeEnv = process.argv[2] || "default";  // Defaulting to 'default' if no argument is provided

// Configuring dotenv to load a specific .env file based on the node identifier
dotenv.config({ path: `.env.${nodeEnv}` });


connectDatabase(); // Establish MongoDB connection

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Logger setup for HTTP requests
app.use(
  morgan("combined", { stream: { write: (message) => console.log(message) } })
);

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply general rate limiting middleware to all requests
app.use(generalRateLimiter());

// Routes
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/faucet", faucetRoutes);
app.use("/api/explorer", explorerRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/nodes", nodeRoutes);

// Error handling middleware for rate limits and general errors
app.use(rateLimitErrorHandler);
app.use(errorMiddleware);

// Socket.IO configuration
io.on("connection", (socket) => {
  console.log(`A user connected with socket id: ${socket.id}`);
  socket.on("disconnect", () => console.log(`User disconnected: ${socket.id}`));
});

// Server start
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
