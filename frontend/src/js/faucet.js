/**
 * Manages interactions with the faucet feature on the blockchain application.
 * Allows users to request tokens for testing purposes by submitting their wallet address.
 */

// Capture form submission
document.getElementById('faucetForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Extract wallet address from the input field
    const walletAddress = document.getElementById('walletAddress').value;

    // Simple validation
    if (!walletAddress) {
        alert('Please enter a wallet address.');
        return;
    }

    // Prepare the data for the POST request
    const data = {
        walletAddress: walletAddress,
        // Additional data like captcha response could be added here
    };

    // Make the request to the backend faucetController
    fetch('/api/faucet/requestCoins', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            throw new Error(data.error);
        }
        // Display success message or transaction details to the user
        alert('Tokens requested successfully. Transaction ID: ' + data.transactionId);
    })
    .catch(error => {
        console.error('Error requesting tokens:', error);
        alert('Error requesting tokens: ' + error.message);
    });
});
