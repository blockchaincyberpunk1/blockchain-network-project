/**
 * @file wallet.js
 * Handles wallet operations such as creating a new wallet, signing transactions, and checking wallet balance.
 * Dependencies: blockchain.js for making API requests to the backend.
 */

/**
 * Creates a new wallet and displays the wallet details.
 */
async function createWallet() {
  try {
    const response = await fetch("/api/wallet/create", { method: "POST" });
    if (!response.ok) {
      throw new Error("Failed to create a new wallet");
    }
    const walletDetails = await response.json();
    displayWalletDetails(walletDetails);
  } catch (error) {
    console.error("Error creating wallet:", error.message);
    alert("Error creating wallet: " + error.message);
  }
}

/**
 * Signs a transaction using the user's private key and sends it to the backend.
 * @param {string} fromAddress The sender's wallet address.
 * @param {string} toAddress The recipient's wallet address.
 * @param {number} amount The amount to transfer.
 * @param {string} privateKey The private key for signing the transaction.
 */
async function sendTransaction(fromAddress, toAddress, amount, privateKey) {
  const transactionData = { fromAddress, toAddress, amount, privateKey };

  try {
    const response = await fetch("/api/wallet/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transactionData),
    });
    if (!response.ok) {
      throw new Error("Failed to send transaction");
    }
    const transactionResponse = await response.json();
    alert("Transaction successful: " + transactionResponse.message);
  } catch (error) {
    console.error("Error sending transaction:", error.message);
    alert("Error sending transaction: " + error.message);
  }
}

/**
 * Retrieves and displays the balance of a given wallet address.
 * @param {string} address The wallet address whose balance is to be checked.
 */
async function checkBalance(address) {
  try {
    const response = await fetch(`/api/wallet/balance/${address}`);
    if (!response.ok) {
      throw new Error("Failed to fetch wallet balance");
    }
    const { balance } = await response.json();
    alert(`Balance for ${address} is ${balance}`);
  } catch (error) {
    console.error("Error fetching wallet balance:", error.message);
    alert("Error fetching wallet balance: " + error.message);
  }
}

/**
 * Displays wallet details to the user.
 * @param {Object} walletDetails The wallet details to display.
 */
function displayWalletDetails(walletDetails) {
  // Assuming there's a div with id 'walletInfo' in the HTML
  const walletInfoDiv = document.getElementById("walletInfo");
  walletInfoDiv.innerHTML = `
        <p>Wallet Address: ${walletDetails.publicKey}</p>
        <p>Private Key: ${walletDetails.privateKey}</p>
    `;
}

// Event listeners for wallet actions
document
  .getElementById("createWalletBtn")
  .addEventListener("click", createWallet);
document.getElementById("sendTransactionBtn").addEventListener("click", () => {
  const fromAddress = document.getElementById("fromAddress").value;
  const toAddress = document.getElementById("toAddress").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const privateKey = document.getElementById("privateKey").value;
  sendTransaction(fromAddress, toAddress, amount, privateKey);
});
document.getElementById("checkBalanceBtn").addEventListener("click", () => {
  const address = document.getElementById("balanceAddress").value;
  checkBalance(address);
});
