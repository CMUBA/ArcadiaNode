import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { showMessage } from '../utils/message.js';
import heroConfig from '../config/hero.js';

const NODE_URL = Network.DEVNET;
const config = new AptosConfig({ network: NODE_URL });
const aptos = new Aptos(config);

const HERO_CONTRACT_ADDRESS = heroConfig.contractAddresses.MOVE_HERO_ADDRESS;
const HERO_NFT_ADDRESS = heroConfig.contractAddresses.MOVE_HERO_NFT_ADDRESS;

let account = null;

// Display contract information
function displayContractInfo() {
    const contractInfo = document.getElementById('contractInfo');
    if (contractInfo) {
        contractInfo.innerHTML = `
            <p>NFT Contract: ${heroConfig.contractAddresses.MOVE_HERO_NFT_ADDRESS}</p>
            <p>Hero Contract: ${heroConfig.contractAddresses.MOVE_HERO_ADDRESS}</p>
            <p>Metadata Contract: ${heroConfig.contractAddresses.MOVE_HERO_METADATA_ADDRESS}</p>
        `;
    }
}

// Connect wallet using Wallet Standard
async function connectWallet() {
    const connectWalletBtn = document.getElementById('connectWalletBtn');

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
        connectWalletBtn.textContent = 'Connected';
        connectWalletBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        connectWalletBtn.classList.add('bg-green-500', 'hover:bg-green-600');
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
        if (!account) {
            throw new Error('Please connect wallet first');
        }

        console.log('Querying NFT contracts from Hero contract:', HERO_CONTRACT_ADDRESS);

        const payload = {
            function: `${HERO_CONTRACT_ADDRESS}::hero::get_nft_contracts`,
            type_arguments: [],
            arguments: [account]
        };

        console.log('Query payload:', payload);

        const response = await aptos.view(payload);
        console.log('Query response:', response);

        const nftList = document.getElementById('nftList');
        
        if (response && response.length > 0) {
            const nfts = response[0];
            console.log('Found NFTs:', nfts);
            let html = '<h3 class="text-lg font-semibold mb-2">Your NFTs:</h3>';
            nfts.forEach((nft, index) => {
                html += `
                    <div class="bg-white p-4 rounded shadow mb-4">
                        <p class="font-medium">NFT #${index + 1}</p>
                        <p>Token ID: ${nft.token_id}</p>
                        <p>Owner: ${nft.owner}</p>
                        <button onclick="burnNFT('${nft.token_id}')" class="mt-2 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                            Burn NFT
                        </button>
                    </div>
                `;
            });
            nftList.innerHTML = html;
        } else {
            console.log('No NFTs found in response');
            nftList.innerHTML = '<p>No NFTs found</p>';
        }

        showMessage('NFTs retrieved successfully');
    } catch (error) {
        console.error('Error querying NFTs:', error);
        showMessage(`Error querying NFT list: ${error.message}`, 'error');
    }
}

// Query NFT price
async function queryNFTPrice() {
    try {
        if (!account) {
            throw new Error('Please connect wallet first');
        }

        const contractAddress = document.getElementById('contractAddress').value;
        const tokenId = document.getElementById('tokenId').value;

        if (!contractAddress || !tokenId) {
            throw new Error('Please provide both contract address and token ID');
        }

        // Query native token price
        const nativePayload = {
            function: `${HERO_NFT_ADDRESS}::hero_nft::get_native_price`,
            type_arguments: [],
            arguments: [contractAddress, tokenId]
        };

        // Query token price
        const tokenPayload = {
            function: `${HERO_NFT_ADDRESS}::hero_nft::get_token_price`,
            type_arguments: [],
            arguments: [contractAddress, tokenId]
        };

        const [nativeResponse, tokenResponse] = await Promise.all([
            aptos.view(nativePayload),
            aptos.view(tokenPayload)
        ]);

        const priceInfo = document.getElementById('priceInfo');
        priceInfo.innerHTML = `
            <div class="bg-gray-50 p-4 rounded">
                <h3 class="text-lg font-semibold mb-2">Price Information:</h3>
                <p class="mb-2"><strong>Native Price (APT):</strong> ${nativeResponse[0]}</p>
                <p><strong>Token Price (ARC):</strong> ${tokenResponse[0]}</p>
            </div>
        `;

        showMessage('Price information retrieved successfully');
    } catch (error) {
        showMessage(`Error querying price: ${error.message}`, 'error');
    }
}

// Initialize page
function initializePage() {
    displayContractInfo();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        displayContractInfo();
        if (window.aptos?.isConnected) {
            await connectWallet();
        }
        await loadNFTs();
    } catch (error) {
        console.error('Error during page initialization:', error);
        showMessage(`Error during initialization: ${error.message}`);
    }
});

// Export functions to window object
window.connectWallet = connectWallet;
window.initializeContract = initializeContract;
window.setDefaultPrices = setDefaultPrices;
window.setPriceConfig = setPriceConfig;
window.mintNFT = mintNFT;
window.batchMintNFT = batchMintNFT;
window.loadNFTs = loadNFTs;
window.burnNFT = burnNFT;
window.getDefaultPrices = getDefaultPrices;
window.queryHeroNFTList = queryHeroNFTList;
window.queryNFTPrice = queryNFTPrice;

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
async function mintNFT(useToken = false) {
    try {
        if (!account) {
            throw new Error('Please connect wallet first');
        }

        console.log('Minting NFT with parameters:', { useToken, account });

        const tokenId = document.getElementById('singleTokenId').value;
        const amount = document.getElementById('singleAmount').value;

        if (!tokenId || !amount) {
            throw new Error('Please provide both token ID and amount');
        }

        console.log('Mint parameters:', { tokenId, amount });

        const functionName = useToken ? 'mint_with_token' : 'mint_with_native';
        const typeArgs = useToken ? 
            ['0x1::aptos_coin::AptosCoin'] : // For token minting
            ['0x1::aptos_coin::AptosCoin']; // For native minting

        const payload = {
            type: 'entry_function_payload',
            function: `${HERO_NFT_ADDRESS}::hero_nft::${functionName}`,
            type_arguments: typeArgs,
            arguments: [parseInt(tokenId), parseInt(amount)]
        };

        console.log('Mint payload:', payload);

        const response = await window.aptos.signAndSubmitTransaction(payload);
        console.log('Mint transaction submitted:', response);

        await aptos.waitForTransaction({ transactionHash: response.hash });
        console.log('Mint transaction confirmed');

        showMessage('NFT minted successfully');
        await queryHeroNFTList();
    } catch (error) {
        console.error('Error minting NFT:', error);
        showMessage(`Error minting NFT: ${error.message}`, true);
    }
}

// Batch mint NFTs
async function batchMintNFT(useToken = false) {
    try {
        if (!account) {
            throw new Error('Please connect wallet first');
        }

        console.log('Batch minting NFTs with parameters:', { useToken, account });

        const tokenIdsStr = document.getElementById('batchTokenIds').value;
        const amount = document.getElementById('batchAmount').value;

        if (!tokenIdsStr || !amount) {
            throw new Error('Please provide both token IDs and amount');
        }

        const tokenIds = tokenIdsStr.split(',').map(id => parseInt(id.trim()));
        console.log('Batch mint parameters:', { tokenIds, amount });

        const functionName = useToken ? 'mint_batch_with_token' : 'mint_batch_with_native';
        const typeArgs = useToken ? 
            ['0x1::aptos_coin::AptosCoin'] : // For token minting
            ['0x1::aptos_coin::AptosCoin']; // For native minting

        const payload = {
            type: 'entry_function_payload',
            function: `${HERO_NFT_ADDRESS}::hero_nft::${functionName}`,
            type_arguments: typeArgs,
            arguments: [tokenIds, parseInt(amount)]
        };

        console.log('Batch mint payload:', payload);

        const response = await window.aptos.signAndSubmitTransaction(payload);
        console.log('Batch mint transaction submitted:', response);

        await aptos.waitForTransaction({ transactionHash: response.hash });
        console.log('Batch mint transaction confirmed');

        showMessage('NFTs minted successfully');
        await queryHeroNFTList();
    } catch (error) {
        console.error('Error batch minting NFTs:', error);
        showMessage(`Error batch minting NFTs: ${error.message}`, true);
    }
}

// Load NFTs
async function loadNFTs() {
    try {
        if (!account) {
            showMessage('Please connect wallet first');
            return;
        }

        console.log('Loading NFTs for account:', account);
        console.log('Using NFT contract:', HERO_NFT_ADDRESS);

        const resources = await aptos.getAccountResources({
            accountAddress: account,
        });

        console.log('Account resources:', resources);

        const nftResource = resources?.find(r => 
            r.type === `${HERO_NFT_ADDRESS}::hero_nft::TokenStore`
        );

        console.log('NFT resource:', nftResource);

        const nftList = document.getElementById('nftList');
        nftList.innerHTML = '';

        if (nftResource?.data?.tokens) {
            console.log('Found tokens:', nftResource.data.tokens);
            for (const [tokenId, amount] of Object.entries(nftResource.data.tokens)) {
                const nftElement = document.createElement('div');
                nftElement.className = 'bg-white p-4 rounded shadow mb-4';
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
            console.log('No NFTs found');
            nftList.innerHTML = '<p class="text-gray-500">No NFTs found</p>';
        }
    } catch (error) {
        console.error('Error loading NFTs:', error);
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
        if (!account) {
            throw new Error('Please connect wallet first');
        }

        console.log('Getting default prices from contract:', HERO_NFT_ADDRESS);
        
        const resource = await aptos.getAccountResource({
            accountAddress: HERO_NFT_ADDRESS,
            resourceType: `${HERO_NFT_ADDRESS}::hero_nft::TokenPriceConfig`
        });

        console.log('Price resource:', resource);

        if (resource && resource.data) {
            const priceConfig = resource.data;
            console.log('Price config:', priceConfig);
            document.getElementById('currentNativePrice').textContent = `Default Native Price: ${priceConfig.native_price} APT`;
            document.getElementById('currentTokenPrice').textContent = `Default Token Price: ${priceConfig.token_price}`;
        } else {
            console.log('No price configuration found');
            showMessage('Price configuration not found');
        }
    } catch (error) {
        console.error('Error getting default prices:', error);
        showMessage(`Error getting default prices: ${error.message}`);
    }
} 