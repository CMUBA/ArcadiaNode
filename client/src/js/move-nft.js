import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { showMessage } from '../utils/message.js';
import { config as envConfig } from '../config/index.js';

const NODE_URL = Network.DEVNET;
const config = new AptosConfig({ network: NODE_URL });
const aptos = new Aptos(config);

const HERO_CONTRACT_ADDRESS = envConfig.contractAddresses.MOVE_HERO_ADDRESS;
const HERO_NFT_ADDRESS = envConfig.contractAddresses.MOVE_HERO_NFT_ADDRESS;

let account = null;

// Display contract information
function displayContractInfo() {
    const contractInfo = document.getElementById('contractInfo');
    if (contractInfo) {
        contractInfo.innerHTML = `
            <p>NFT Contract: ${envConfig.MOVE_HERO_NFT_ADDRESS}</p>
            <p>Hero Contract: ${envConfig.MOVE_HERO_ADDRESS}</p>
            <p>Metadata Contract: ${envConfig.MOVE_HERO_METADATA_ADDRESS}</p>
        `;
    }
}

// Connect wallet using Wallet Standard
async function connectWallet() {
    try {
        // Check if any wallet is available
        if (!('aptos' in window)) {
            throw new Error('Please install a wallet that supports the Aptos Wallet Standard');
        }

        // Use Wallet Standard to connect
        const walletStandard = window.aptos;
        const response = await walletStandard.connect();
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

// Query hero contract's NFT list
async function queryHeroNFTList() {
    try {
        const resource = await aptos.getAccountResource({
            accountAddress: HERO_CONTRACT_ADDRESS,
            resourceType: `${HERO_CONTRACT_ADDRESS}::hero::HeroData`
        });

        const nftList = document.getElementById('nftContractList');
        nftList.innerHTML = '';

        if (resource && resource.data.nft_contracts) {
            const contracts = resource.data.nft_contracts;
            contracts.forEach(contract => {
                const div = document.createElement('div');
                div.className = 'p-4 bg-gray-50 rounded mb-2';
                div.textContent = `NFT Contract: ${contract}`;
                nftList.appendChild(div);
            });
        } else {
            nftList.innerHTML = '<p class="text-gray-500">No NFT contracts found</p>';
        }
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Query NFT price
async function queryNFTPrice() {
    const contractAddress = document.getElementById('contractAddress').value;
    const tokenId = document.getElementById('tokenId').value;

    if (!contractAddress || !tokenId) {
        showMessage('Please provide both contract address and token ID', true);
        return;
    }

    try {
        // Query native token price
        const nativePrice = await aptos.view({
            payload: {
                function: `${HERO_NFT_ADDRESS}::hero_nft::get_native_price`,
                typeArguments: [],
                functionArguments: [contractAddress, tokenId]
            }
        });

        // Query token price
        const tokenPrice = await aptos.view({
            payload: {
                function: `${HERO_NFT_ADDRESS}::hero_nft::get_token_price`,
                typeArguments: [],
                functionArguments: [contractAddress, tokenId]
            }
        });

        const priceInfo = document.getElementById('priceInfo');
        priceInfo.innerHTML = `
            <div class="bg-gray-50 p-4 rounded">
                <p class="mb-2"><strong>Native Price (APT):</strong> ${nativePrice}</p>
                <p><strong>Token Price (ARC):</strong> ${tokenPrice}</p>
            </div>
        `;
    } catch (error) {
        showMessage(error.message, true);
    }
}

// Export functions to window object
Object.assign(window, {
    connectWallet,
    initializeContract,
    setDefaultPrices,
    setPriceConfig,
    mintNFT,
    batchMintNFT,
    loadNFTs,
    burnNFT,
    getDefaultPrices,
    queryHeroNFTList,
    queryNFTPrice
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        displayContractInfo();
        if (window.aptos?.isConnected) {
            await connectWallet();
        }
        // 自动加载NFTs
        await loadNFTs();
    } catch (error) {
        console.error('Error during page initialization:', error);
        showMessage(`Error during initialization: ${error.message}`);
    }
});

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

        const resources = await aptos.getAccountResources({
            accountAddress: account,
        });

        const nftResource = resources?.find(r => 
            r.type === `${envConfig.MOVE_HERO_NFT_ADDRESS}::hero_nft::TokenStore`
        );

        const nftList = document.getElementById('nftList');
        nftList.innerHTML = '';

        if (nftResource?.data?.tokens) {
            for (const [tokenId, amount] of Object.entries(nftResource.data.tokens)) {
                const nftElement = document.createElement('div');
                nftElement.className = 'bg-white p-4 rounded shadow';
                nftElement.innerHTML = `
                    <h3 class="text-lg font-bold">Hero NFT</h3>
                    <p>Token ID: ${tokenId}</p>
                    <p>Amount: ${amount}</p>
                    <button onclick="burnNFT('${tokenId}')" class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Burn NFT
                    </button>
                `;
                nftList.appendChild(nftElement);
            }
        }

        if (nftList.children.length === 0) {
            nftList.innerHTML = '<p class="text-gray-500">No NFTs found</p>';
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

// Get default prices
async function getDefaultPrices() {
    try {
        const tokenId = Number.parseInt(document.getElementById('queryTokenId').value);
        
        const resource = await aptos.getAccountResource({
            accountAddress: envConfig.MOVE_HERO_NFT_ADDRESS,
            resourceType: `${envConfig.MOVE_HERO_NFT_ADDRESS}::hero_nft::TokenPriceConfig`
        });

        if (resource && resource.data) {
            const priceConfig = resource.data;
            document.getElementById('currentNativePrice').textContent = `Default Native Price: ${priceConfig.native_price} APT`;
            document.getElementById('currentTokenPrice').textContent = `Default Token Price: ${priceConfig.token_price}`;
        } else {
            showMessage('Price configuration not found');
        }
    } catch (error) {
        showMessage(`Error getting default prices: ${error.message}`);
    }
} 