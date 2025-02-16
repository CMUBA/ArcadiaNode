import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { showMessage } from '../utils/message.js';
import { config as envConfig } from '../config/index.js';

const NODE_URL = Network.DEVNET;
const config = new AptosConfig({ network: NODE_URL });
const aptos = new Aptos(config);

const METADATA_CONTRACT_ADDRESS = envConfig.contractAddresses.MOVE_HERO_METADATA_ADDRESS;

let account = null;

// Connect wallet using Wallet Standard
async function connectWallet() {
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

// Set metadata for a token
async function setMetadata() {
    try {
        const tokenId = document.getElementById('tokenId').value;
        const metadataUri = document.getElementById('metadataUri').value;

        if (!tokenId || !metadataUri) {
            showMessage('Please provide both token ID and metadata URI', true);
            return;
        }

        const payload = {
            type: "entry_function_payload",
            function: `${METADATA_CONTRACT_ADDRESS}::metadata::set_token_metadata`,
            type_arguments: [],
            arguments: [tokenId, metadataUri]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('Metadata set successfully');
        await getMetadata();
    } catch (error) {
        showMessage(`Error setting metadata: ${error.message}`, true);
    }
}

// Get metadata for a token
async function getMetadata() {
    try {
        const tokenId = document.getElementById('tokenId').value;

        if (!tokenId) {
            showMessage('Please provide a token ID', true);
            return;
        }

        const metadata = await aptos.view({
            payload: {
                function: `${METADATA_CONTRACT_ADDRESS}::metadata::get_token_metadata`,
                type_arguments: [],
                functionArguments: [tokenId]
            }
        });

        const metadataInfo = document.getElementById('metadataInfo');
        if (metadata) {
            metadataInfo.innerHTML = `
                <div class="space-y-2">
                    <p><strong>Token ID:</strong> ${metadata.token_id}</p>
                    <p><strong>URI:</strong> ${metadata.uri}</p>
                    <p><strong>Last Updated:</strong> ${new Date(metadata.last_updated * 1000).toLocaleString()}</p>
                </div>
            `;
        } else {
            metadataInfo.innerHTML = '<p class="text-gray-500">No metadata found for this token</p>';
        }
    } catch (error) {
        showMessage(`Error getting metadata: ${error.message}`, true);
    }
}

// Refresh token list
async function refreshTokenList() {
    try {
        const tokens = await aptos.view({
            payload: {
                function: `${METADATA_CONTRACT_ADDRESS}::metadata::get_all_tokens`,
                type_arguments: [],
                functionArguments: []
            }
        });

        const tokenList = document.getElementById('tokenList');
        if (tokens && tokens.length > 0) {
            tokenList.innerHTML = tokens.map(token => `
                <div class="p-4 bg-white rounded-lg shadow">
                    <h3 class="font-semibold text-lg mb-2">Token ${token.token_id}</h3>
                    <p class="text-sm text-gray-600 mb-2"><strong>URI:</strong> ${token.uri}</p>
                    <p class="text-sm text-gray-600"><strong>Last Updated:</strong> ${new Date(token.last_updated * 1000).toLocaleString()}</p>
                </div>
            `).join('');
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
        if (!account) {
            showMessage('Please connect wallet first');
            return;
        }

        const races = await aptos.view({
            function: "hero::metadata::get_all_races",
            type_arguments: [],
            arguments: []
        });

        const classes = await aptos.view({
            function: "hero::metadata::get_all_classes",
            type_arguments: [],
            arguments: []
        });

        const skills = await aptos.view({
            function: "hero::metadata::get_all_skills",
            type_arguments: [],
            arguments: []
        });

        // Display races
        const raceList = document.getElementById('raceList');
        raceList.innerHTML = races.map(race => `
            <div class="p-2 bg-gray-100 rounded">
                <p><strong>Name:</strong> ${race.name}</p>
                <p><strong>Description:</strong> ${race.description}</p>
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

// Event listeners
window.connectWallet = connectWallet;
window.setMetadata = setMetadata;
window.getMetadata = getMetadata;
window.refreshTokenList = refreshTokenList;

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