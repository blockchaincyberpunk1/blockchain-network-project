/**
 * explorer.js - Handles the fetching and display of blockchain data on the explorer page.
 *
 * Dependencies:
 * - blockchain.js for API calls
 *
 * Backend API Dependencies:
 * - GET /api/blockchain for fetching the entire blockchain
 * - GET /api/transactions/:address for fetching transactions by address
 * - GET /api/balance/:address for fetching the balance of a specific address
 */

import {
  getBlockchain,
  getTransactionsForAddress,
  getBalanceOfAddress,
} from "./blockchain";

/**
 * Fetches and displays the entire blockchain.
 */
async function displayBlockchain() {
  try {
    const blockchain = await getBlockchain();
    const blockchainContainer = document.getElementById("blockchainContainer");
    blockchainContainer.innerHTML = ""; // Clear previous entries
    blockchain.forEach((block) => {
      const blockElement = document.createElement("div");
      blockElement.className = "block";
      blockElement.innerHTML = `
                <h5>Block #${block.index}</h5>
                <p>Hash: ${block.hash}</p>
                <p>Previous Hash: ${block.previousHash}</p>
                <p>Timestamp: ${new Date(block.timestamp).toLocaleString()}</p>
                <p>Transactions: ${block.transactions.length}</p>
            `;
      blockchainContainer.appendChild(blockElement);
    });
  } catch (error) {
    console.error("Failed to fetch blockchain:", error);
    alert("Error fetching blockchain data. Please try again later.");
  }
}

/**
 * Fetches and displays transactions for a specific blockchain address.
 * @param {string} address The blockchain address to fetch transactions for.
 */
async function displayTransactions(address) {
  try {
    const transactions = await getTransactionsForAddress(address);
    const transactionsContainer = document.getElementById(
      "transactionsContainer"
    );
    transactionsContainer.innerHTML = ""; // Clear previous entries
    transactions.forEach((transaction) => {
      const transactionElement = document.createElement("div");
      transactionElement.className = "transaction";
      transactionElement.innerHTML = `
                <p>From: ${transaction.fromAddress}</p>
                <p>To: ${transaction.toAddress}</p>
                <p>Amount: ${transaction.amount}</p>
                <p>Date: ${new Date(transaction.timestamp).toLocaleString()}</p>
            `;
      transactionsContainer.appendChild(transactionElement);
    });
  } catch (error) {
    console.error(
      `Failed to fetch transactions for address ${address}:`,
      error
    );
    alert("Error fetching transactions. Please try again later.");
  }
}

/**
 * Fetches and displays the balance for a specific blockchain address.
 * @param {string} address The blockchain address to fetch the balance for.
 */
async function displayBalance(address) {
  try {
    const balance = await getBalanceOfAddress(address);
    const balanceElement = document.getElementById("balanceContainer");
    balanceElement.innerHTML = `<p>Balance: ${balance} Coins</p>`;
  } catch (error) {
    console.error(`Failed to fetch balance for address ${address}:`, error);
    alert("Error fetching balance. Please try again later.");
  }
}

// Event listeners for user interactions, e.g., clicking on a "Load Transactions" button
document
  .getElementById("loadBlockchainButton")
  .addEventListener("click", displayBlockchain);
document
  .getElementById("loadTransactionsButton")
  .addEventListener("click", () => {
    const address = document.getElementById("addressInput").value;
    displayTransactions(address);
  });
document.getElementById("loadBalanceButton").addEventListener("click", () => {
  const address = document.getElementById("addressInput").value;
  displayBalance(address);
});

/**
 * Initializes the explorer page by loading the blockchain data automatically on page load.
 */
window.onload = () => {
  displayBlockchain();
};
