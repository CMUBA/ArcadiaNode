import { ethers } from 'ethers';
import { heroNFTAbi } from './abi/heroNFT.js';
import config from '../config/hero.js';

// Utility functions
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

function showMessage(message) {
    console.log(message);
    const messageElement = getElement('message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.classList.remove('hidden');
        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, 3000);
    }
}

function showError(error) {
    const errorMessage = error.message || error.toString();
    console.error(errorMessage);
    const messageElement = getElement('message');
    if (messageElement) {
        messageElement.textContent = `Error: ${errorMessage}`;
        messageElement.classList.remove('hidden');
        messageElement.classList.add('bg-red-500');
        setTimeout(() => {
            messageElement.classList.add('hidden');
            messageElement.classList.remove('bg-red-500');
        }, 5000);
    }
}

function validateAddress(address) {
    try {
        return ethers.isAddress(address);
    } catch {
        return false;
    }
}

function validateNumber(num) {
    return !Number.isNaN(num) && Number.isInteger(Number(num)) && num >= 0;
}

function setInputValue(elementId, value) {
    const element = getElement(elementId);
    if (element) {
        element.value = value;
    }
}

// Contract state
let provider;
let signer;
let connectedAddress;
let heroNFTContract;

// Contract address from config
const nftContractAddress = config.ethereum.contracts.heroNFT;

// Initialize contract
async function initContract() {
    try {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        heroNFTContract = new ethers.Contract(nftContractAddress, heroNFTAbi, signer);
        
        return true;
    } catch (error) {
        console.error('Error initializing contract:', error);
        return false;
    }
}

// Connect wallet
async function connectWallet() {
    try {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        // Request connection to Optimism Sepolia
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa37dc' }],
        });

        const success = await initContract();
        if (!success) {
            throw new Error('Failed to initialize contract');
        }

        connectedAddress = await signer.getAddress();
        updateWalletUI();
        await updateContractInfo();
        
        showMessage('Wallet connected successfully');
        return true;
    } catch (error) {
        showError(error);
        return false;
    }
}

// Update UI elements
function updateWalletUI() {
    const connectWalletBtn = getElement('connectWallet');
    const connectedWalletDiv = getElement('connectedWallet');
    const walletAddressSpan = getElement('walletAddress');
    
    if (connectWalletBtn && connectedWalletDiv && walletAddressSpan) {
        connectWalletBtn.textContent = 'Connected';
        connectWalletBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        connectWalletBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        
        connectedWalletDiv.classList.remove('hidden');
        walletAddressSpan.textContent = connectedAddress;
    }

    const walletButtons = document.querySelectorAll('.requires-wallet');
    for (const button of walletButtons) {
        button.disabled = false;
    }
}

// Update contract info
async function updateContractInfo() {
    try {
        setInputValue('contractAddress', nftContractAddress);
        
        if (!heroNFTContract) {
            const readOnlyProvider = new ethers.JsonRpcProvider('https://sepolia.optimism.io');
            heroNFTContract = new ethers.Contract(nftContractAddress, heroNFTAbi, readOnlyProvider);
        }
        
        if (heroNFTContract) {
            const version = await heroNFTContract.VERSION();
            setInputValue('contractVersion', version);
            
            const owner = await heroNFTContract.owner();
            setInputValue('ownerAddress', owner);
        }
    } catch (error) {
        console.error('Error updating contract info:', error);
        showError(error);
    }
}

// NFT Minting
async function mintNFT(useToken = false) {
    try {
        const tokenId = Number(getElement('mintTokenId').value);
        const amount = getElement('mintAmount').value;
        
        if (!tokenId || Number.isNaN(tokenId)) {
            throw new Error('Please enter a valid token ID');
        }

        let tx;
        if (useToken) {
            const defaultToken = await heroNFTContract.getDefaultPaymentToken();
            tx = await heroNFTContract.mintWithToken(tokenId, defaultToken);
        } else {
            const price = await heroNFTContract.getDefaultNativePrice();
            tx = await heroNFTContract.mint(tokenId, { value: price });
        }

        showMessage('Minting NFT... Please wait for transaction confirmation');
        await tx.wait();
        showMessage('NFT minted successfully');
        await updateContractInfo();
    } catch (error) {
        showError(error);
    }
}

// Batch Minting
async function batchMintNFT(useToken = false) {
    try {
        const tokenIds = getElement('batchTokenIds').value
            .split(',')
            .map(id => Number(id.trim()));
        
        if (!tokenIds.every(id => validateNumber(id))) {
            throw new Error('Please enter valid token IDs');
        }

        let tx;
        if (useToken) {
            const defaultToken = await heroNFTContract.getDefaultPaymentToken();
            const price = await heroNFTContract.getDefaultTokenPrice();
            const totalPrice = price * BigInt(tokenIds.length);
            tx = await heroNFTContract.mintBatchWithToken(tokenIds, defaultToken);
        } else {
            const price = await heroNFTContract.getDefaultNativePrice();
            const totalPrice = price * BigInt(tokenIds.length);
            tx = await heroNFTContract.mintBatch(tokenIds, { value: totalPrice });
        }

        showMessage('Minting NFTs... Please wait for transaction confirmation');
        await tx.wait();
        showMessage('Batch NFT minting successful');
        await updateContractInfo();
    } catch (error) {
        showError(error);
    }
}

// NFT Burning
async function burnNFT() {
    try {
        const tokenId = getElement('burnTokenId').value;
        
        if (!validateNumber(tokenId)) {
            throw new Error('Please enter a valid token ID');
        }

        const tx = await heroNFTContract.burn(tokenId);
        showMessage('Burning NFT... Please wait for transaction confirmation');
        await tx.wait();
        showMessage('NFT burned successfully');
        await updateContractInfo();
    } catch (error) {
        showError(error);
    }
}

// Additional NFT Contract Functions
async function approveOperator(operator, tokenId) {
    try {
        if (!validateAddress(operator)) {
            throw new Error('Invalid operator address');
        }
        if (!validateNumber(tokenId)) {
            throw new Error('Invalid token ID');
        }

        const tx = await heroNFTContract.approve(operator, tokenId);
        showMessage('Approving operator... Please wait for confirmation');
        await tx.wait();
        showMessage('Operator approved successfully');
    } catch (error) {
        showError(error);
    }
}

async function setApprovalForAll(operator, approved) {
    try {
        if (!validateAddress(operator)) {
            throw new Error('Invalid operator address');
        }

        const tx = await heroNFTContract.setApprovalForAll(operator, approved);
        showMessage('Setting approval for all... Please wait for confirmation');
        await tx.wait();
        showMessage('Approval for all set successfully');
    } catch (error) {
        showError(error);
    }
}

async function transferFrom(from, to, tokenId) {
    try {
        if (!validateAddress(from) || !validateAddress(to)) {
            throw new Error('Invalid address');
        }
        if (!validateNumber(tokenId)) {
            throw new Error('Invalid token ID');
        }

        const tx = await heroNFTContract.transferFrom(from, to, tokenId);
        showMessage('Transferring NFT... Please wait for confirmation');
        await tx.wait();
        showMessage('NFT transferred successfully');
    } catch (error) {
        showError(error);
    }
}

async function safeTransferFrom(from, to, tokenId, data = "0x") {
    try {
        if (!validateAddress(from) || !validateAddress(to)) {
            throw new Error('Invalid address');
        }
        if (!validateNumber(tokenId)) {
            throw new Error('Invalid token ID');
        }

        const tx = await heroNFTContract["safeTransferFrom(address,address,uint256,bytes)"](
            from, to, tokenId, data
        );
        showMessage('Safely transferring NFT... Please wait for confirmation');
        await tx.wait();
        showMessage('NFT safely transferred successfully');
    } catch (error) {
        showError(error);
    }
}

async function ownerOf(tokenId) {
    try {
        if (!validateNumber(tokenId)) {
            throw new Error('Invalid token ID');
        }

        const owner = await heroNFTContract.ownerOf(tokenId);
        showMessage('Owner retrieved successfully');
        return owner;
    } catch (error) {
        showError(error);
        return null;
    }
}

async function balanceOf(owner) {
    try {
        if (!validateAddress(owner)) {
            throw new Error('Invalid owner address');
        }

        const balance = await heroNFTContract.balanceOf(owner);
        showMessage('Balance retrieved successfully');
        return balance;
    } catch (error) {
        showError(error);
        return null;
    }
}

async function tokenURI(tokenId) {
    try {
        if (!validateNumber(tokenId)) {
            throw new Error('Invalid token ID');
        }

        const uri = await heroNFTContract.tokenURI(tokenId);
        showMessage('Token URI retrieved successfully');
        return uri;
    } catch (error) {
        showError(error);
        return null;
    }
}

async function isApprovedForAll(owner, operator) {
    try {
        if (!validateAddress(owner) || !validateAddress(operator)) {
            throw new Error('Invalid address');
        }

        const isApproved = await heroNFTContract.isApprovedForAll(owner, operator);
        showMessage('Approval status checked successfully');
        return isApproved;
    } catch (error) {
        showError(error);
        return false;
    }
}

async function getApproved(tokenId) {
    try {
        if (!validateNumber(tokenId)) {
            throw new Error('Invalid token ID');
        }

        const approved = await heroNFTContract.getApproved(tokenId);
        showMessage('Approved address retrieved successfully');
        return approved;
    } catch (error) {
        showError(error);
        return null;
    }
}

// Price Configuration Functions
async function setPriceConfig() {
    try {
        const tokenId = Number(getElement('priceConfigTokenId').value);
        const tokenAddress = getElement('priceConfigTokenAddress').value;
        const amount = getElement('priceConfigAmount').value;

        if (!validateNumber(tokenId)) {
            throw new Error('Please enter a valid token ID');
        }
        if (!validateAddress(tokenAddress)) {
            throw new Error('Please enter a valid token address');
        }
        if (!amount || Number.isNaN(Number(amount))) {
            throw new Error('Please enter a valid amount');
        }

        const tx = await heroNFTContract.setPriceConfig(
            tokenId,
            tokenAddress,
            ethers.parseUnits(amount, 18)
        );
        showMessage('Setting price configuration... Please wait for confirmation');
        await tx.wait();
        showMessage('Price configuration set successfully');
    } catch (error) {
        showError(error);
    }
}

async function getPriceConfig() {
    try {
        const tokenId = Number(getElement('priceConfigTokenId').value);
        if (!validateNumber(tokenId)) {
            throw new Error('Please enter a valid token ID');
        }

        const config = await heroNFTContract.getPriceConfig(tokenId);
        const priceConfigInfo = getElement('priceConfigInfo');
        if (priceConfigInfo) {
            priceConfigInfo.textContent = 
                `Token Address: ${config.tokenAddress}\n` +
                `Price: ${ethers.formatUnits(config.price, 18)}\n` +
                `Active: ${config.isActive}`;
        }
        showMessage('Price configuration retrieved successfully');
    } catch (error) {
        showError(error);
    }
}

// Token Management Functions
async function checkTokenExists() {
    try {
        const tokenId = Number(getElement('tokenId').value);
        if (!validateNumber(tokenId)) {
            throw new Error('Please enter a valid token ID');
        }

        const exists = await heroNFTContract.exists(tokenId);
        const tokenInfo = getElement('tokenInfo');
        if (tokenInfo) {
            tokenInfo.textContent = `Token ${tokenId} ${exists ? 'exists' : 'does not exist'}`;
        }
        showMessage('Token existence checked successfully');
    } catch (error) {
        showError(error);
    }
}

async function checkTokenApproval() {
    try {
        const tokenId = Number(getElement('tokenId').value);
        const operator = getElement('operatorAddress').value;

        if (!validateNumber(tokenId)) {
            throw new Error('Please enter a valid token ID');
        }
        if (!validateAddress(operator)) {
            throw new Error('Please enter a valid operator address');
        }

        const isApproved = await heroNFTContract.isApprovedForToken(operator, tokenId);
        const tokenInfo = getElement('tokenInfo');
        if (tokenInfo) {
            tokenInfo.textContent = 
                `Operator ${operator} is ${isApproved ? 'approved' : 'not approved'} for token ${tokenId}`;
        }
        showMessage('Token approval checked successfully');
    } catch (error) {
        showError(error);
    }
}

async function getAcceptedTokens() {
    try {
        const tokenId = Number(getElement('tokenId').value);
        if (!validateNumber(tokenId)) {
            throw new Error('Please enter a valid token ID');
        }

        const tokens = await heroNFTContract.getAcceptedTokens(tokenId);
        const tokenInfo = getElement('tokenInfo');
        if (tokenInfo) {
            tokenInfo.textContent = 
                `Accepted tokens for token ${tokenId}:\n${tokens.join('\n')}`;
        }
        showMessage('Accepted tokens retrieved successfully');
    } catch (error) {
        showError(error);
    }
}

// Default Payment Settings
async function getDefaultPaymentToken() {
    try {
        const token = await heroNFTContract.getDefaultPaymentToken();
        const defaultPaymentToken = getElement('defaultPaymentToken');
        if (defaultPaymentToken) {
            defaultPaymentToken.value = token;
        }
        showMessage('Default payment token retrieved successfully');
    } catch (error) {
        showError(error);
    }
}

async function getDefaultNativePrice() {
    try {
        const price = await heroNFTContract.getDefaultNativePrice();
        const defaultNativePrice = getElement('defaultNativePrice');
        if (defaultNativePrice) {
            defaultNativePrice.value = ethers.formatEther(price);
        }
        showMessage('Default native price retrieved successfully');
    } catch (error) {
        showError(error);
    }
}

async function getDefaultTokenPrice() {
    try {
        const price = await heroNFTContract.getDefaultTokenPrice();
        const defaultTokenPrice = getElement('defaultTokenPrice');
        if (defaultTokenPrice) {
            defaultTokenPrice.value = ethers.formatUnits(price, 18);
        }
        showMessage('Default token price retrieved successfully');
    } catch (error) {
        showError(error);
    }
}

async function setDefaultNativePrice() {
    try {
        const price = getElement('defaultNativePrice').value;
        if (!price || Number.isNaN(Number(price))) {
            throw new Error('Please enter a valid price amount');
        }

        const tx = await heroNFTContract.setDefaultNativePrice(ethers.parseEther(price));
        showMessage('Setting default native price... Please wait for confirmation');
        await tx.wait();
        showMessage('Default native price set successfully');
    } catch (error) {
        showError(error);
    }
}

async function setDefaultTokenPrice() {
    try {
        const price = getElement('defaultTokenPrice').value;
        if (!price || Number.isNaN(Number(price))) {
            throw new Error('Please enter a valid price amount');
        }

        const tx = await heroNFTContract.setDefaultTokenPrice(ethers.parseUnits(price, 18));
        showMessage('Setting default token price... Please wait for confirmation');
        await tx.wait();
        showMessage('Default token price set successfully');
    } catch (error) {
        showError(error);
    }
}

// Add NFT price checking and minting functions
async function checkNFTPrice() {
    try {
        const tokenId = Number(getElement('mintTokenId').value);
        if (!validateNumber(tokenId)) {
            throw new Error('Please enter a valid token ID');
        }

        // Get price config for specific tokenId
        const priceConfig = await heroNFTContract.getPriceConfig(tokenId);
        
        if (priceConfig?.isActive) {
            getElement('ethPrice').textContent = `${ethers.formatEther(priceConfig?.price)} ETH`;
            getElement('tokenPrice').textContent = `${ethers.formatUnits(priceConfig?.price, 18)} Tokens`;
        } else {
            // Fallback to default prices if no specific price config
            const ethPrice = await heroNFTContract.getDefaultNativePrice();
            const tokenPrice = await heroNFTContract.getDefaultTokenPrice();
            
            getElement('ethPrice').textContent = `${ethers.formatEther(ethPrice)} ETH`;
            getElement('tokenPrice').textContent = `${ethers.formatUnits(tokenPrice, 18)} Tokens`;
        }

        // Get balances
        const ethBalance = await provider.getBalance(connectedAddress);
        getElement('ethBalance').textContent = `${ethers.formatEther(ethBalance)} ETH`;

        const tokenContract = new ethers.Contract(
            await heroNFTContract.getDefaultPaymentToken(),
            ['function balanceOf(address) view returns (uint256)'],
            provider
        );
        const tokenBalance = await tokenContract.balanceOf(connectedAddress);
        getElement('tokenBalance').textContent = `${ethers.formatUnits(tokenBalance, 18)} Tokens`;

        showMessage('Price information updated successfully');
    } catch (error) {
        showError(error);
    }
}

async function mintWithEth() {
    try {
        const tokenId = getElement('mintTokenId').value;
        if (!tokenId || !validateNumber(tokenId)) {
            throw new Error('Please enter a valid token ID');
        }

        // Get price for specific tokenId
        const priceConfig = await heroNFTContract.getPriceConfig(tokenId);
        const price = priceConfig?.isActive ? priceConfig.price : await heroNFTContract.getDefaultNativePrice();
        
        showMessage('Minting NFT... Please wait for confirmation');
        
        // Pass both the recipient address and tokenId
        const tx = await heroNFTContract.mint(connectedAddress, tokenId, { value: price });
        await tx.wait();
        showMessage('NFT minted successfully with ETH');
        await checkNFTPrice(); // Refresh balances
    } catch (error) {
        showError(error);
    }
}

async function mintWithToken() {
    try {
        const tokenId = getElement('mintTokenId').value;
        if (!tokenId || !validateNumber(tokenId)) {
            throw new Error('Please enter a valid token ID');
        }

        const paymentToken = await heroNFTContract.getDefaultPaymentToken();
        if (!validateAddress(paymentToken)) {
            throw new Error('Invalid payment token address');
        }

        // Get price for specific tokenId
        const priceConfig = await heroNFTContract.getPriceConfig(tokenId);
        const price = priceConfig?.isActive ? priceConfig.price : await heroNFTContract.getDefaultTokenPrice();

        showMessage('Minting NFT... Please wait for confirmation');
        // Pass recipient address, tokenId, and payment token
        const tx = await heroNFTContract.mintWithToken(connectedAddress, tokenId, paymentToken);
        await tx.wait();
        showMessage('NFT minted successfully with token');
        await checkNFTPrice(); // Refresh balances
    } catch (error) {
        showError(error);
    }
}

async function batchMintWithEth() {
    try {
        const tokenIds = getElement('batchTokenIds').value
            .split(',')
            .map(id => Number(id.trim()))
            .filter(id => !Number.isNaN(id));

        if (tokenIds.length === 0) {
            throw new Error('Please enter valid token IDs');
        }

        const price = await heroNFTContract.getDefaultNativePrice();
        const totalPrice = price * BigInt(tokenIds.length);
        const tx = await heroNFTContract.mintBatch(tokenIds, { value: totalPrice });
        showMessage('Batch minting NFTs... Please wait for confirmation');
        await tx.wait();
        showMessage('NFTs batch minted successfully with ETH');
        await checkNFTPrice(); // Refresh balances
    } catch (error) {
        showError(error);
    }
}

async function batchMintWithToken() {
    try {
        const tokenIds = getElement('batchTokenIds').value
            .split(',')
            .map(id => Number(id.trim()))
            .filter(id => !Number.isNaN(id));

        if (tokenIds.length === 0) {
            throw new Error('Please enter valid token IDs');
        }

        const paymentToken = await heroNFTContract.getDefaultPaymentToken();
        const tx = await heroNFTContract.mintBatchWithToken(tokenIds, paymentToken);
        showMessage('Batch minting NFTs... Please wait for confirmation');
        await tx.wait();
        showMessage('NFTs batch minted successfully with token');
        await checkNFTPrice(); // Refresh balances
    } catch (error) {
        showError(error);
    }
}

// Add event listener for page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Disable wallet-required buttons initially
        const walletButtons = document.querySelectorAll('.requires-wallet');
        for (const button of walletButtons) {
            button.disabled = true;
        }

        if (window.ethereum?.selectedAddress) {
            await connectWallet();
        }

        // Initialize contract info
        await updateContractInfo();
    } catch (error) {
        console.error('Error during page initialization:', error);
        showError(error);
    }
});

// Export functions for use in HTML
window.connectWallet = connectWallet;
window.mintWithEth = mintWithEth;
window.mintWithToken = mintWithToken;
window.batchMintWithEth = batchMintWithEth;
window.batchMintWithToken = batchMintWithToken;
window.burnNFT = burnNFT;
window.setPriceConfig = setPriceConfig;
window.getPriceConfig = getPriceConfig;
window.checkTokenExists = checkTokenExists;
window.checkTokenApproval = checkTokenApproval;
window.getAcceptedTokens = getAcceptedTokens;
window.getDefaultPaymentToken = getDefaultPaymentToken;
window.getDefaultNativePrice = getDefaultNativePrice;
window.getDefaultTokenPrice = getDefaultTokenPrice;
window.setDefaultNativePrice = setDefaultNativePrice;
window.setDefaultTokenPrice = setDefaultTokenPrice;
window.checkNFTPrice = checkNFTPrice;

// Export additional functions to window object
Object.assign(window, {
    approveOperator,
    setApprovalForAll,
    transferFrom,
    safeTransferFrom,
    ownerOf,
    balanceOf,
    tokenURI,
    isApprovedForAll,
    getApproved
}); 