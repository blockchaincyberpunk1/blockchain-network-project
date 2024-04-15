/**
 * @file faucet.js
 * Manages interactions with the blockchain faucet to request tokens.
 * Depends on `blockchain.js` for shared API utility functions.
 */

/**
 * Sends a token request to the faucet.
 * @param {string} recipientAddress The blockchain address of the recipient.
 * @param {number} amount The amount of tokens to request.
 * @returns {Promise<void>} A promise that resolves with no value upon successful token request.
 */
async function requestTokens(recipientAddress, amount) {
  try {
    // Prepare the data for the API call
    const requestData = {
      recipientAddress,
      amount,
    };

    // Making an API request to the backend faucet endpoint
    const response = await fetch("/api/faucet/request-tokens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    // Handle non-successful responses
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to request tokens: ${errorData.message}`);
    }

    // Handle successful response
    const responseData = await response.json();
    console.log("Tokens requested successfully:", responseData);
    alert(
      `Tokens sent successfully! Transaction ID: ${responseData.transaction.id}`
    );
  } catch (error) {
    console.error("Error requesting tokens:", error);
    alert(`Error: ${error.message}`);
  }
}

/**
 * Event listeners and bindings for UI elements.
 */
document.addEventListener("DOMContentLoaded", function () {
  const requestForm = document.getElementById("requestTokensForm");
  if (requestForm) {
    requestForm.addEventListener("submit", function (event) {
      event.preventDefault();
      const recipientAddress =
        document.getElementById("recipientAddress").value;
      const amount = parseFloat(document.getElementById("amount").value);
      if (!recipientAddress || isNaN(amount) || amount <= 0) {
        alert("Please provide a valid address and amount.");
        return;
      }
      requestTokens(recipientAddress, amount);
    });
  }
});
