/**
 * @file miner.js
 * @description Handles mining requests to the blockchain backend, including initiating the mining process
 * and displaying the results or errors to the user.
 */

document.addEventListener("DOMContentLoaded", function () {
  const mineButton = document.getElementById("mineButton");
  const outputArea = document.getElementById("output");

  /**
   * Initiates mining on the blockchain network by sending a request to the backend.
   * @param {Event} event - The event object from the form submission.
   */
  function handleMining(event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Disable the button to prevent multiple requests
    mineButton.disabled = true;
    mineButton.textContent = "Mining...";

    // Clear previous outputs
    outputArea.textContent = "";

    // Call the backend to initiate mining
    blockchainAPI
      .mineBlocks()
      .then((response) => {
        if (response.success) {
          outputArea.textContent = `Mining successful! New block added to the blockchain.`;
        } else {
          throw new Error(
            response.message || "Unknown error occurred during mining."
          );
        }
      })
      .catch((error) => {
        outputArea.textContent = `Error: ${error.message}`;
        console.error("Mining failed:", error);
      })
      .finally(() => {
        // Re-enable the button after the request is complete
        mineButton.disabled = false;
        mineButton.textContent = "Start Mining";
      });
  }

  // Add event listener to the mining button
  mineButton.addEventListener("click", handleMining);
});
