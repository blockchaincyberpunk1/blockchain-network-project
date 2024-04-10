/**
 * @file app.js
 * @description Initializes an Express server with integrated Socket.IO and JWT authentication for secure real-time communication.
 * Incorporates Morgan for logging HTTP requests and Winston for application-wide logging to aid in monitoring and debugging.
 */

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const morgan = require("morgan");
require("dotenv").config();

// Custom imports for logging and error handling
const logger = require("./lib/logger"); // Adjust the path as necessary
const errorMiddleware = require("./middleware/errorMiddleware");

// Import routes
const blockchainRoutes = require("./routes/blockchainRoutes");
const walletRoutes = require("./routes/walletRoutes");
const faucetRoutes = require("./routes/faucetRoutes");

// Initialize the Express application and HTTP server
const app = express();
const server = http.createServer(app);

// Secret key for JWT, used in Socket.IO authentication
const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key_here";

// Configure Socket.IO with the HTTP server, including CORS settings
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Use Morgan middleware for logging HTTP requests in the Apache combined format
app.use(
  morgan("combined", { stream: { write: (message) => logger.info(message) } })
);

// Middleware for parsing JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes for blockchain, wallet, and faucet APIs
app.use("/api/blockchain", blockchainRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/faucet", faucetRoutes);

/**
 * Connect to MongoDB using the URI provided in the environment variables.
 */
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => logger.info("MongoDB connected"))
  .catch((err) => {
    logger.error("MongoDB connection error:", err);
    process.exit(1); // Exit in a controlled manner on database connection failure
  });

/**
 * Middleware for JWT authentication in Socket.IO connections.
 * @param {Object} socket - The incoming socket connection.
 * @param {Function} next - Callback to pass control to the next middleware.
 */
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) {
    next(new Error("Authentication error: Token not provided"));
  } else {
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        next(new Error("Authentication error: Invalid token"));
      } else {
        socket.decoded = decoded;
        next();
      }
    });
  }
});

/**
 * Handles new Socket.IO connections, setting up event listeners for custom events like 'syncRequest'.
 * @param {Object} socket - The socket instance for the connected client.
 */
io.on("connection", (socket) => {
  logger.info("A user connected", { socketId: socket.id });

  socket.emit("welcome", "Welcome to the blockchain network!");

  socket.on("syncRequest", (data) => {
    logger.info("Sync request received", { data });
  });

  socket.on("disconnect", () => {
    logger.info("User disconnected", { socketId: socket.id });
  });
});

// Error handling middleware, placed after all route handlers
app.use(errorMiddleware);

// Start the server on the configured port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
