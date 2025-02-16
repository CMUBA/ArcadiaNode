import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { showMessage } from '../utils/message.js';
import heroConfig from '../config/hero.js';

const NODE_URL = Network.DEVNET;
const config = new AptosConfig({ network: NODE_URL });
const aptos = new Aptos(config);

const METADATA_CONTRACT_ADDRESS = heroConfig.contractAddresses.MOVE_HERO_METADATA_ADDRESS;

let account = null;

// Connect wallet using Wallet Standard
async function connectWallet() {
    const connectWalletBtn = document.getElementById('connectWalletBtn');

    try {
        // Check if Petra wallet is installed
        if (!window.aptos) {
            throw new Error('Please install Petra wallet extension');
        }

        // Use Wallet Standard to connect
        const response = await window.aptos.connect();
        account = response.address;
        
        // Update UI
        document.getElementById('walletAddress').textContent = `Connected: ${account}`;
        connectWalletBtn.textContent = 'Connected';
        connectWalletBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        connectWalletBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        showMessage('Wallet connected successfully');
        
        // Enable buttons that require wallet connection
        const walletButtons = document.querySelectorAll('.requires-wallet');
        for (const button of walletButtons) {
            button.disabled = false;
        }
        
        // Refresh metadata after connection
        await refreshMetadata();
        
        return true;
    } catch (error) {
        showMessage(`Error connecting wallet: ${error.message}`);
        return false;
    }
}

// Display contract information
function displayContractInfo() {
    const contractInfo = document.getElementById('contractInfo');
    if (contractInfo) {
        contractInfo.innerHTML = `
            <p>Metadata Contract: ${heroConfig.contractAddresses.MOVE_HERO_METADATA_ADDRESS}</p>
        `;
    }
}

// Set token metadata
async function setTokenMetadata() {
    try {
        if (!account) {
            throw new Error('Please connect wallet first');
        }

        const tokenId = document.getElementById('tokenId').value;
        const name = document.getElementById('tokenName').value;
        const description = document.getElementById('tokenDescription').value;
        const image = document.getElementById('tokenImage').value;

        if (!tokenId || !name || !description || !image) {
            throw new Error('Please fill in all metadata fields');
        }

        const metadata = {
            name,
            description,
            image
        };
        const payload = {
            type: "entry_function_payload",
            function: `${METADATA_CONTRACT_ADDRESS}::metadata::set_token_metadata`,
            type_arguments: [],
            arguments: [tokenId, JSON.stringify(metadata)]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('Token metadata set successfully');
        await getTokenMetadata();
    } catch (error) {
        showMessage(`Error setting token metadata: ${error.message}`, 'error');
    }
}

// Get token metadata
async function getTokenMetadata() {
    try {
        if (!account) {
            throw new Error('Please connect wallet first');
        }

        const tokenId = document.getElementById('queryTokenId').value;
        if (!tokenId) {
            throw new Error('Please enter token ID');
        }

        const payload = {
            function: `${METADATA_CONTRACT_ADDRESS}::metadata::get_token_metadata`,
            type_arguments: [],
            arguments: [tokenId]
        };

        const response = await aptos.view(payload);
        const tokenMetadata = document.getElementById('tokenMetadata');
        
        if (response && response.length > 0) {
            const metadata = JSON.parse(response[0]);
            tokenMetadata.innerHTML = `
                <h3 class="text-lg font-semibold mb-2">Token Metadata:</h3>
                <p>Name: ${metadata.name}</p>
                <p>Description: ${metadata.description}</p>
                <p>Image: ${metadata.image}</p>
            `;
        } else {
            tokenMetadata.innerHTML = '<p>No metadata found for this token</p>';
        }

        showMessage('Token metadata retrieved successfully');
    } catch (error) {
        showMessage(`Error getting token metadata: ${error.message}`, 'error');
    }
}

// Get all tokens
async function getAllTokens() {
    try {
        if (!account) {
            throw new Error('Please connect wallet first');
        }

        const payload = {
            function: `${METADATA_CONTRACT_ADDRESS}::metadata::get_all_tokens`,
            type_arguments: [],
            arguments: []
        };

        const response = await aptos.view(payload);
        const tokenList = document.getElementById('tokenList');
        
        if (response && response.length > 0) {
            const tokens = response[0];
            tokenList.innerHTML = `<h3 class="text-lg font-semibold mb-2">Token List:</h3>`;
            tokens.forEach((token, index) => {
                const metadata = JSON.parse(token.metadata);
                tokenList.innerHTML += `
                    <div class="p-4 bg-gray-50 rounded mb-2">
                        <p class="font-semibold">Token #${index + 1}</p>
                        <p>ID: ${token.id}</p>
                        <p>Name: ${metadata.name}</p>
                        <p>Description: ${metadata.description}</p>
                        <p>Image: ${metadata.image}</p>
                    </div>
                `;
            });
        } else {
            tokenList.innerHTML = '<p class="text-gray-500">No tokens found</p>';
        }
    } catch (error) {
        showMessage(`Error refreshing token list: ${error.message}`, true);
    }
}

// Refresh metadata information
async function refreshMetadata() {
    try {
        displayContractInfo();
        if (account) {
            await getAllTokens();
        }
    } catch (error) {
        showMessage(`Error refreshing metadata: ${error.message}`, 'error');
    }
}
                <p><strong>Base Stats:</strong> ${race.base_stats.join(', ')}</p>
            </div>
        `).join('');

        // Display classes
        const classList = document.getElementById('classList');
        classList.innerHTML = classes.map(class_ => `
            <div class="p-2 bg-gray-100 rounded">
                <p><strong>Name:</strong> ${class_.name}</p>
                <p><strong>Description:</strong> ${class_.description}</p>
                <p><strong>Base Skills:</strong> ${class_.base_skills.join(', ')}</p>
            </div>
        `).join('');

        // Display skills
        const skillList = document.getElementById('skillList');
        skillList.innerHTML = skills.map(skill => `
            <div class="p-2 bg-gray-100 rounded">
                <p><strong>Name:</strong> ${skill.name}</p>
                <p><strong>Description:</strong> ${skill.description}</p>
                <p><strong>Damage:</strong> ${skill.damage}</p>
                <p><strong>Cost:</strong> ${skill.cost}</p>
            </div>
        `).join('');
    } catch (error) {
        showMessage(`Error refreshing metadata: ${error.message}`);
    }
}

// Initialize the page
function initializePage() {
    displayContractInfo();
}

// Event listeners
window.addEventListener('load', initializePage);
window.connectWallet = connectWallet;
window.setTokenMetadata = setTokenMetadata;
window.getTokenMetadata = getTokenMetadata;
window.getAllTokens = getAllTokens;


// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (window.aptos?.isConnected) {
            await connectWallet();
        }
    } catch (error) {
        console.error('Error during page initialization:', error);
        showMessage(`Error during initialization: ${error.message}`);
    }
}); 