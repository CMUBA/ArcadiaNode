import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { showMessage } from '../utils/message.js';

const NODE_URL = Network.DEVNET;
const config = new AptosConfig({ network: NODE_URL });
const aptos = new Aptos(config);

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
        
        return true;
    } catch (error) {
        showMessage(`Error connecting wallet: ${error.message}`);
        return false;
    }
}

// Initialize contract
async function initializeContract() {
    try {
        const payload = {
            type: "entry_function_payload",
            function: "hero_nft::hero_nft::initialize",
            type_arguments: [],
            arguments: []
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('Contract initialized successfully');
    } catch (error) {
        showMessage(`Error initializing contract: ${error.message}`);
    }
}

// Set default prices
async function setDefaultPrices() {
    try {
        const nativePrice = Number.parseInt(document.getElementById('defaultNativePrice').value);
        const tokenPrice = Number.parseInt(document.getElementById('defaultTokenPrice').value);

        const payload = {
            type: "entry_function_payload",
            function: "hero_nft::hero_nft::set_default_prices",
            type_arguments: [],
            arguments: [nativePrice, tokenPrice]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('Default prices set successfully');
    } catch (error) {
        showMessage(`Error setting default prices: ${error.message}`);
    }
}

// Set price configuration
async function setPriceConfig() {
    try {
        const tokenId = Number.parseInt(document.getElementById('priceTokenId').value);
        const tokenName = document.getElementById('priceTokenName').value;
        const price = Number.parseInt(document.getElementById('tokenPrice').value);

        const payload = {
            type: "entry_function_payload",
            function: "hero_nft::hero_nft::set_price_config",
            type_arguments: [],
            arguments: [tokenId, tokenName, price]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('Price configuration set successfully');
    } catch (error) {
        showMessage(`Error setting price configuration: ${error.message}`);
    }
}

// Mint NFT
async function mintNFT() {
    try {
        const tokenId = Number.parseInt(document.getElementById('tokenId').value);
        const amount = Number.parseInt(document.getElementById('amount').value);

        const payload = {
            type: "entry_function_payload",
            function: "hero_nft::hero_nft::mint_with_native",
            type_arguments: [],
            arguments: [tokenId, amount]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('NFT minted successfully');
        loadNFTs();
    } catch (error) {
        showMessage(`Error minting NFT: ${error.message}`);
    }
}

// Batch mint NFTs
async function batchMintNFT() {
    try {
        const tokenIds = document.getElementById('batchTokenIds').value
            .split(',')
            .map(id => Number.parseInt(id.trim()));
        const amount = Number.parseInt(document.getElementById('batchAmount').value);

        const payload = {
            type: "entry_function_payload",
            function: "hero_nft::hero_nft::mint_batch_with_native",
            type_arguments: [],
            arguments: [tokenIds, amount]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('NFTs minted successfully');
        loadNFTs();
    } catch (error) {
        showMessage(`Error batch minting NFTs: ${error.message}`);
    }
}

// Load NFTs
async function loadNFTs() {
    try {
        if (!account) {
            showMessage('Please connect wallet first');
            return;
        }

        const nfts = await aptos.getAccountNFTs({
            accountAddress: account,
            collectionName: "Hero NFT"
        });

        const nftList = document.getElementById('nftList');
        nftList.innerHTML = '';

        for (const nft of nfts) {
            const nftElement = document.createElement('div');
            nftElement.className = 'bg-white p-4 rounded shadow';
            nftElement.innerHTML = `
                <h3 class="text-lg font-bold">${nft.name}</h3>
                <p>Token ID: ${nft.token_id}</p>
                <p>Amount: ${nft.amount}</p>
                <button onclick="burnNFT('${nft.token_id}')" class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                    Burn NFT
                </button>
            `;
            nftList.appendChild(nftElement);
        }
    } catch (error) {
        showMessage(`Error loading NFTs: ${error.message}`);
    }
}

// Burn NFT
async function burnNFT(tokenId) {
    try {
        const payload = {
            type: "entry_function_payload",
            function: "hero_nft::hero_nft::burn",
            type_arguments: [],
            arguments: [tokenId]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('NFT burned successfully');
        loadNFTs();
    } catch (error) {
        showMessage(`Error burning NFT: ${error.message}`);
    }
}

// Event listeners
window.connectWallet = connectWallet;
window.initializeContract = initializeContract;
window.setDefaultPrices = setDefaultPrices;
window.setPriceConfig = setPriceConfig;
window.mintNFT = mintNFT;
window.batchMintNFT = batchMintNFT;
window.loadNFTs = loadNFTs;
window.burnNFT = burnNFT; 