/**
 * Handles interaction with the mining operations on the blockchain miner frontend.
 */

// Define API endpoints or paths as needed
const API_BASE_URL = '/api/blockchain'; // Adjust this base URL as per your backend routing structure

/**
 * Initializes event listeners and UI components necessary for mining operations.
 */
function init() {
    document.getElementById('startMining').addEventListener('click', startMining);
    document.getElementById('stopMining').addEventListener('click', stopMining);
}

/**
 * Initiates mining operations by sending a request to the backend and updates the UI accordingly.
 */
function startMining() {
    updateMiningStatus('Mining started...');

    // Example request to start mining - adjust URL/path as needed
    fetch(`${API_BASE_URL}/mine`, { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            updateMiningStatus('Mining completed.');
            addMinedBlockToList(data.block);
        })
        .catch(error => {
            console.error('Error starting mining:', error);
            updateMiningStatus('Mining failed.');
        });
}

/**
 * Stops the ongoing mining operations by sending a stop command to the backend. Updates the UI to reflect this action.
 */
function stopMining() {
    // Here you would send a request to your backend to stop mining if your backend supports it
    // For demonstration, we're just updating the status
    updateMiningStatus('Mining stopped.');
}

/**
 * Updates the mining status on the UI.
 * @param {string} status - The mining status message to display.
 */
function updateMiningStatus(status) {
    document.getElementById('miningStatus').textContent = status;
}

/**
 * Adds a newly mined block to the list of blocks on the UI.
 * @param {Object} block - The block object returned from the mining operation.
 */
function addMinedBlockToList(block) {
    const listElement = document.createElement('li');
    listElement.classList.add('list-group-item');
    // Adjust the displayed content as per your block structure
    listElement.textContent = `Block #${block.index}: ${block.hash.substring(0, 20)}...`;
    document.getElementById('minedBlocksList').appendChild(listElement);
}

// Initialize the script once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
