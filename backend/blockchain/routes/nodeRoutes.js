const express = require("express");
const NodeController = require("../controllers/nodeController");
const SynchronizationService = require("../services/SynchronizationService");
const BlockchainService = require("../services/BlockchainService"); // Ensure this is required

// Create a new instance of BlockchainService
const blockchainService = new BlockchainService();

// Create a new instance of SynchronizationService with the required BlockchainService instance
const synchronizationService = new SynchronizationService(blockchainService); // Pass the blockchainService instance
const nodeController = new NodeController(synchronizationService);

const router = express.Router();

/**
 * POST /nodes/register
 * Route to register a new node in the blockchain network.
 */
router.post("/register", async (req, res) => {
  try {
    const { nodeUrl } = req.body;
    const node = nodeController.registerNode(nodeUrl);
    res.status(201).json({
      success: true,
      message: "Node registered successfully",
      node,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /nodes
 * Route to list all registered nodes in the blockchain network.
 */
router.get("/", (req, res) => {
  try {
    const nodes = nodeController.listNodes();
    res.status(200).json({
      success: true,
      nodes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve nodes",
    });
  }
});

/**
 * POST /nodes/synchronize
 * Route to initiate synchronization with another node.
 */
router.post("/synchronize", async (req, res) => {
  try {
    const { nodeUrl } = req.body;
    await nodeController.synchronizeWithNode(nodeUrl);
    res.status(200).json({
      success: true,
      message: "Synchronization successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Synchronization failed: ${error.message}`,
    });
  }
});

module.exports = router;
