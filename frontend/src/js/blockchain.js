/**
 * @file blockchain.js
 * @description Utility functions to interact with the blockchain backend.
 */

const apiUrl = "http://localhost:3000/api"; // Base URL for the backend API

/**
 * Fetches the entire blockchain data from the backend.
 * @returns {Promise<Object>} The blockchain data.
 */
async function fetchBlockchain() {
  try {
    const response = await fetch(`${apiUrl}/blockchain/chain`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch blockchain data:", error);
    throw error; // Re-throw to allow caller to handle it further
  }
}

/**
 * Posts a new transaction to the blockchain.
 * @param {Object} transactionData - Data for the transaction including fromAddress, toAddress, amount, privateKey.
 * @returns {Promise<Object>} The response from the backend after posting the transaction.
 */
async function postTransaction(transactionData) {
  try {
    const response = await fetch(`${apiUrl}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionData),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to post transaction:", error);
    throw error;
  }
}

/**
 * Retrieves the balance for a specified blockchain address.
 * @param {string} address - The blockchain address to query.
 * @returns {Promise<number>} The balance of the address.
 */
async function getBalance(address) {
  try {
    const response = await fetch(`${apiUrl}/balance/${address}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.balance;
  } catch (error) {
    console.error(`Failed to retrieve balance for address ${address}:`, error);
    throw error;
  }
}

// Export the functions to be available for import in other modules
export { fetchBlockchain, postTransaction, getBalance };
