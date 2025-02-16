import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { showMessage } from '../utils/message.js';
import heroConfig from '../config/hero.js';

const NODE_URL = Network.DEVNET;
const config = new AptosConfig({ network: NODE_URL });
const aptos = new Aptos(config);

const HERO_CONTRACT_ADDRESS = heroConfig.contractAddresses.MOVE_HERO_ADDRESS;
const HERO_NFT_ADDRESS = heroConfig.contractAddresses.MOVE_HERO_NFT_ADDRESS;

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
        
        // Refresh hero info after connection
        await refreshHeroInfo();
        
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
            <p>Hero Contract: ${heroConfig.contractAddresses.MOVE_HERO_ADDRESS}</p>
            <p>NFT Contract: ${heroConfig.contractAddresses.MOVE_HERO_NFT_ADDRESS}</p>
            <p>Metadata Contract: ${heroConfig.contractAddresses.MOVE_HERO_METADATA_ADDRESS}</p>
        `;
    }
}

// Create hero
async function createHero() {
    try {
        if (!account) {
            throw new Error('Please connect wallet first');
        }

        const name = document.getElementById('heroName').value;
        const nftContract = document.getElementById('heroNFTContract').value;
        const tokenId = document.getElementById('heroTokenId').value;

        if (!name || !nftContract || !tokenId) {
            throw new Error('Please fill in all hero creation fields');
        }

        const payload = {
            type: "entry_function_payload",
            function: `${HERO_CONTRACT_ADDRESS}::hero::create_hero`,
            type_arguments: [],
            arguments: [name, race, class_, nftContract, tokenId]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('Hero created successfully');
        refreshHeroInfo();
    } catch (error) {
        showMessage(`Error creating hero: ${error.message}`, true);
    }
}

// Register NFT contract
async function registerNFTContract() {
    try {
        const nftContract = document.getElementById('registerNftContract').value;

        if (!nftContract) {
            showMessage('Please provide NFT contract address', true);
            return;
        }

        const payload = {
            type: "entry_function_payload",
            function: `${HERO_CONTRACT_ADDRESS}::hero::register_nft_contract`,
            type_arguments: [],
            arguments: [nftContract]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('NFT contract registered successfully');
        await refreshHeroInfo();
    } catch (error) {
        showMessage(`Error registering NFT contract: ${error.message}`, true);
    }
}

// Get hero list
async function getHeroList() {
    try {
        if (!account) {
            throw new Error('Please connect wallet first');
        }

        const payload = {
            function: `${HERO_CONTRACT_ADDRESS}::hero::get_hero_list`,
            type_arguments: [],
            arguments: [account]
        };

        const response = await aptos.view(payload);
        const heroList = document.getElementById('heroList');
        
        if (response && response.length > 0) {
            const heroes = response[0];
            heroList.innerHTML = `<h3 class="text-lg font-semibold mb-2">Hero List:</h3>`;
            heroes.forEach((hero, index) => {
                heroList.innerHTML += `
                    <div class="p-4 bg-gray-50 rounded mb-2">
                        <p class="font-semibold">Hero #${index + 1}</p>
                        <p>Name: ${hero.name}</p>
                        <p>Level: ${hero.level}</p>
                        <p>Energy: ${hero.energy}</p>
                        <p>Daily Points: ${hero.daily_points}</p>
                    </div>
                `;
            });
        } else {
            heroList.innerHTML = '<p>No heroes found</p>';
        }

        showMessage('Hero list retrieved successfully');
    } catch (error) {
        showMessage(`Error getting hero list: ${error.message}`, 'error');
    }
}

// Get NFT contracts
async function getNFTContracts() {
    try {
        const contracts = await aptos.view({
            payload: {
                function: `${HERO_CONTRACT_ADDRESS}::hero::get_nft_contracts`,
                type_arguments: [],
                functionArguments: []
            }
        });

        const contractList = document.getElementById('nftContractList');
        if (contracts && contracts.length > 0) {
            contractList.innerHTML = contracts.map(contract => `
                <div class="p-4 bg-white rounded-lg shadow mb-2">
                    <p class="font-mono text-sm">${contract}</p>
                </div>
            `).join('');
        } else {
            contractList.innerHTML = '<p class="text-gray-500">No NFT contracts registered</p>';
        }
    } catch (error) {
        showMessage(`Error getting NFT contracts: ${error.message}`, true);
    }
}

// Consume energy
async function consumeEnergy() {
    try {
        const amount = Number.parseInt(document.getElementById('energyAmount').value);

        const payload = {
            type: "entry_function_payload",
            function: "hero::hero::consume_energy",
            type_arguments: [],
            arguments: [amount]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('Energy consumed successfully');
        refreshHeroInfo();
    } catch (error) {
        showMessage(`Error consuming energy: ${error.message}`);
    }
}

// Add daily points
async function addDailyPoints() {
    try {
        const points = Number.parseInt(document.getElementById('pointsAmount').value);

        const payload = {
            type: "entry_function_payload",
            function: "hero::hero::add_daily_points",
            type_arguments: [],
            arguments: [points]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('Points added successfully');
        refreshHeroInfo();
    } catch (error) {
        showMessage(`Error adding points: ${error.message}`);
    }
}

// Refresh hero information
async function refreshHeroInfo() {
    try {
        if (!account) {
            showMessage('Please connect wallet first');
            return;
        }

        const heroInfo = await aptos.view({
            function: "hero::hero::get_hero_info",
            type_arguments: [],
            arguments: [account]
        });

        const skills = await aptos.view({
            function: "hero::hero::get_hero_skills",
            type_arguments: [],
            arguments: [account]
        });

        const equipment = await aptos.view({
            function: "hero::hero::get_hero_equipment",
            type_arguments: [],
            arguments: [account]
        });

        const heroInfoDiv = document.getElementById('heroInfo');
        heroInfoDiv.innerHTML = `
            <p><strong>Name:</strong> ${heroInfo[0]}</p>
            <p><strong>Race:</strong> ${heroInfo[1]}</p>
            <p><strong>Class:</strong> ${heroInfo[2]}</p>
            <p><strong>Level:</strong> ${heroInfo[3]}</p>
            <p><strong>Energy:</strong> ${heroInfo[4]}</p>
            <p><strong>Daily Points:</strong> ${heroInfo[5]}</p>
            <p><strong>Skills:</strong> ${JSON.stringify(skills)}</p>
            <p><strong>Equipment:</strong> ${JSON.stringify(equipment)}</p>
        `;
    } catch (error) {
        showMessage(`Error refreshing hero info: ${error.message}`);
    }
}

// Get hero data
async function getHeroData() {
    try {
        if (!account) {
            throw new Error('Please connect wallet first');
        }

        const heroId = document.getElementById('heroId').value;
        if (!heroId) {
            throw new Error('Please enter hero ID');
        }

        const payload = {
            function: `${HERO_CONTRACT_ADDRESS}::hero::get_hero_data`,
            type_arguments: [],
            arguments: [heroId]
        };

        const response = await aptos.view(payload);
        const heroData = document.getElementById('heroData');
        
        if (response && response.length > 0) {
            const hero = response[0];
            heroData.innerHTML = `
                <h3 class="text-lg font-semibold mb-2">Hero Data:</h3>
                <p>Name: ${hero.name}</p>
                <p>NFT Contract: ${hero.nft_contract}</p>
                <p>Token ID: ${hero.token_id}</p>
                <p>Owner: ${hero.owner}</p>
            `;
        } else {
            heroData.innerHTML = '<p>No hero data found</p>';
        }

        showMessage('Hero data retrieved successfully');
    } catch (error) {
        showMessage(`Error getting hero data: ${error.message}`, 'error');
    }
}

// Initialize the page
function initializePage() {
    displayContractInfo();
}

// Event listeners
window.addEventListener('load', initializePage);
window.connectWallet = connectWallet;
window.createHero = createHero;
window.getHeroList = getHeroList;
window.registerNFTContract = registerNFTContract;
window.getNFTContracts = getNFTContracts;
window.getHeroData = getHeroData;
window.consumeEnergy = consumeEnergy;
window.addDailyPoints = addDailyPoints;
window.registerNFTContract = registerNFTContract;
window.getHeroList = getHeroList;
window.getHeroData = getHeroData;
window.getNFTContracts = getNFTContracts;
window.refreshHeroInfo = refreshHeroInfo;

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