/**
 * blockchain.js
 * Interacts with the backend to fetch blockchain data and display it on the frontend.
 */

/**
 * Fetches the latest blockchain state and displays it.
 */
async function fetchBlockchainState() {
  try {
    const response = await fetch("/api/blockchain/state", { method: "GET" });
    if (!response.ok) throw new Error("Failed to fetch blockchain state");
    const data = await response.json();
    displayBlockchainState(data);
  } catch (error) {
    console.error("Error fetching blockchain state:", error);
  }
}

/**
 * Fetches and displays the latest blocks from the blockchain.
 */
async function fetchLatestBlocks() {
  try {
    const response = await fetch("/api/blockchain/latestBlocks", {
      method: "GET",
    });
    if (!response.ok) throw new Error("Failed to fetch latest blocks");
    const blocks = await response.json();
    displayBlocks(blocks);
  } catch (error) {
    console.error("Error fetching latest blocks:", error);
  }
}

/**
 * Submits a request to mine a new block.
 */
async function mineBlock() {
  try {
    const response = await fetch("/api/blockchain/mine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ miningRewardAddress: "your_wallet_address" }), // Update with actual data or user input
    });
    if (!response.ok) throw new Error("Failed to mine block");
    const result = await response.json();
    alert("Block mined successfully: " + JSON.stringify(result));
    fetchBlockchainState(); // Refresh blockchain state
  } catch (error) {
    console.error("Error mining block:", error);
  }
}

/**
 * Utility function to display blockchain state on the frontend.
 * @param {Object} data - The blockchain state data.
 */
function displayBlockchainState(data) {
  // Implement this function based on how you wish to display the data on your page
  console.log(data);
}

/**
 * Utility function to display the latest blocks on the frontend.
 * @param {Array} blocks - The latest blocks.
 */
function displayBlocks(blocks) {
  // Implement this function based on how you wish to display the blocks on your page
  console.log(blocks);
}

// Example calls
fetchBlockchainState();
fetchLatestBlocks();

// Attach event listeners if necessary, e.g., to a "Mine Block" button
document.getElementById("mineBlockButton").addEventListener("click", mineBlock);
