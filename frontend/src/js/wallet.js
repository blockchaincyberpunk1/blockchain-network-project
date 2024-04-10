/**
 * wallet.js
 * Manages wallet interactions on wallet.html, such as creating wallets, sending transactions, and viewing balances.
 * Depends on backend files: walletController.js for wallet operations and blockchainController.js for blockchain interactions.
 */

/**
 * Initializes the wallet page functionalities, binds event listeners, and loads initial data.
 */
function initializeWalletPage() {
    loadWalletBalance();
    bindSendTransactionForm();
    loadTransactionHistory();
}

/**
 * Loads and displays the wallet balance by calling the backend walletController's getBalance API.
 */
function loadWalletBalance() {
    // Replace 'walletAddress' with the actual wallet address of the user.
    fetch(`/api/wallet/balance/${walletAddress}`)
        .then(response => response.json())
        .then(data => {
            if (data && data.balance) {
                document.getElementById('walletBalance').textContent = `${data.balance} BTC`;
            }
        })
        .catch(error => console.error('Error loading wallet balance:', error));
}

/**
 * Binds the send transaction form submission to the backend createTransaction API.
 */
function bindSendTransactionForm() {
    const form = document.getElementById('sendTransactionForm');
    form.addEventListener('submit', event => {
        event.preventDefault();
        const recipientAddress = document.getElementById('recipientAddress').value;
        const amount = document.getElementById('amount').value;

        // Construct the transaction data
        const transactionData = { recipientAddress, amount };

        // Send the transaction data to the backend
        fetch('/api/wallet/transaction', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Transaction successful:', data);
            // Reload the wallet balance and transaction history
            loadWalletBalance();
            loadTransactionHistory();
        })
        .catch(error => console.error('Error sending transaction:', error));
    });
}

/**
 * Loads and displays the transaction history by calling the backend blockchainController's getTransactionHistory API.
 */
function loadTransactionHistory() {
    // Replace 'walletAddress' with the actual wallet address of the user.
    fetch(`/api/blockchain/transactionHistory/${walletAddress}`)
        .then(response => response.json())
        .then(data => {
            const historyElement = document.getElementById('transactionHistory');
            historyElement.innerHTML = ''; // Clear existing history
            data.transactions.forEach(transaction => {
                const listItem = document.createElement('li');
                listItem.classList.add('list-group-item');
                listItem.textContent = `To: ${transaction.recipient} - Amount: ${transaction.amount} BTC`;
                historyElement.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error loading transaction history:', error));
}

// Call initializeWalletPage when the script loads
initializeWalletPage();
