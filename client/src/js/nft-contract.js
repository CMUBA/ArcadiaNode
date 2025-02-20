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

        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (!accounts || accounts.length === 0) {
            throw new Error('No accounts found');
        }

        // Initialize provider and signer
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        connectedAddress = accounts[0];

        // Initialize contract
        await initContract();

        // Update UI
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

        // Enable wallet-required buttons
        const walletButtons = document.querySelectorAll('.requires-wallet');
        for (const button of walletButtons) {
            button.disabled = false;
        }

        // Add event listeners for account and chain changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        
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
        if (!provider || !signer) {
            throw new Error('Please connect your wallet first');
        }

        const tokenId = getElement('mintTokenId').value;
        if (!tokenId) {
            throw new Error('Please enter a token ID');
        }

        // Initialize contract
        await initContract();
        
        // Get prices
        const ethPrice = await heroNFTContract.getDefaultNativePrice();
        const tokenPrice = await heroNFTContract.getDefaultTokenPrice();
        
        // Update UI
        getElement('ethPrice').textContent = ethers.formatEther(ethPrice);
        getElement('tokenPrice').textContent = ethers.formatEther(tokenPrice);
        
        // Get balances
        const ethBalance = await provider.getBalance(await signer.getAddress());
        getElement('ethBalance').textContent = ethers.formatEther(ethBalance);
        
        const paymentTokenAddress = await heroNFTContract.getDefaultPaymentToken();
        if (paymentTokenAddress !== ethers.ZeroAddress) {
            const erc20Contract = new ethers.Contract(paymentTokenAddress, erc20Abi, provider);
            const tokenBalance = await erc20Contract.balanceOf(await signer.getAddress());
            getElement('tokenBalance').textContent = ethers.formatEther(tokenBalance);
        }
    } catch (error) {
        showError(error);
    }
}

async function mintWithEth() {
    try {
        if (!provider || !signer) {
            throw new Error('Please connect your wallet first');
        }

        const tokenId = getElement('mintTokenId').value;
        if (!tokenId) {
            throw new Error('Please enter a token ID');
        }

        // 检查代币是否已经被铸造
        try {
            const exists = await heroNFTContract.exists(tokenId);
            if (exists) {
                throw new Error(`Token ID ${tokenId} has already been minted`);
            }
        } catch (error) {
            if (error.message.includes('token already minted')) {
                showError(`Token ID ${tokenId} has already been minted`);
                return;
            }
        }

        const price = await heroNFTContract.getDefaultNativePrice();
        const tx = await heroNFTContract.mint(await signer.getAddress(), tokenId, { value: price });
        showMessage('Minting NFT... Please wait for confirmation');
        const receipt = await tx.wait();

        // 显示成功消息和 Etherscan 链接
        const messageElement = getElement('message');
        if (messageElement) {
            const txHash = receipt.hash;
            messageElement.innerHTML = `
                NFT minted successfully! 
                <a href="https://sepolia-optimism.etherscan.io/tx/${txHash}" 
                   target="_blank" 
                   class="text-blue-600 hover:text-blue-800">
                    View on Etherscan
                </a>
            `;
            messageElement.classList.remove('hidden');
        }

        // 刷新价格信息
        await checkNFTPrice();
    } catch (error) {
        if (error.message.includes('token already minted')) {
            showError(`Token ID ${tokenId} has already been minted`);
        } else {
            console.error('Mint error:', error);
            showError(error.message || 'Failed to mint NFT');
        }
    }
}

async function mintWithToken() {
    try {
        if (!connectedAddress) {
            showError('Please connect your wallet first');
            return;
        }

        const tokenId = getElement('tokenId')?.value;
        if (!tokenId || !validateNumber(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }

        // Get default payment token if not specified
        const paymentToken = await heroNFTContract.getDefaultPaymentToken();
        if (!validateAddress(paymentToken)) {
            showError('Invalid payment token address');
            return;
        }

        // Get price config for specific tokenId
        const priceConfig = await heroNFTContract.getPriceConfig(tokenId);
        const price = priceConfig?.isActive ? priceConfig.price : await heroNFTContract.getDefaultTokenPrice();

        // Check token approval
        const tokenContract = new ethers.Contract(
            paymentToken,
            ['function allowance(address,address) view returns (uint256)', 'function approve(address,uint256)'],
            signer
        );

        const allowance = await tokenContract.allowance(connectedAddress, nftContractAddress);
        if (allowance < price) {
            showMessage('Approving tokens... Please wait for confirmation');
            const approveTx = await tokenContract.approve(nftContractAddress, price);
            await approveTx.wait();
            showMessage('Token approval successful');
        }

        showMessage('Minting NFT... Please wait for confirmation');
        const tx = await heroNFTContract.mintWithToken(
            connectedAddress,
            ethers.getBigInt(tokenId),
            paymentToken
        );

        const receipt = await tx.wait();
        
        // Update event log
        logEvent(`NFT minted successfully with token. Transaction hash: ${receipt.hash}`);
        
        showMessage('NFT minted successfully!');
        
        // Refresh contract info
        await updateContractInfo();
    } catch (error) {
        console.error('Mint with token error:', error);
        showError(error.message || 'Failed to mint NFT with token');
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
        if (!connectedAddress) {
            showError('Please connect your wallet first');
            return;
        }

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
    getApproved,
    addPaymentToken,
    getPaymentTokens
});

async function addPaymentToken() {
    try {
        if (!provider || !signer) {
            throw new Error('Please connect your wallet first');
        }

        // 确保合约已初始化
        if (!heroNFTContract) {
            await initContract();
        }

        const tokenAddress = getElement('paymentTokenAddress').value;
        if (!ethers.isAddress(tokenAddress)) {
            throw new Error('Invalid token address');
        }

        const tx = await heroNFTContract.addPaymentToken(tokenAddress);
        showMessage('Adding payment token... Please wait for confirmation');
        await tx.wait();
        showMessage('Payment token added successfully');
        
        // 刷新支付代币列表
        await getPaymentTokens();
    } catch (error) {
        if (error.message.includes('contract runner does not support sending transactions')) {
            showError('Please connect your wallet to send transactions');
        } else {
            showError(error.message || 'Failed to add payment token');
        }
    }
}

async function getPaymentTokens() {
    try {
        // 使用只读提供者初始化合约
        const readOnlyProvider = new ethers.JsonRpcProvider('https://sepolia.optimism.io');
        const readOnlyContract = new ethers.Contract(nftContractAddress, heroNFTAbi, readOnlyProvider);

        const tokens = await readOnlyContract.getPaymentTokens();
        const tokensList = getElement('paymentTokensList');
        if (tokensList) {
            tokensList.innerHTML = tokens.map(token => `
                <div class="flex items-center justify-between p-2 border-b">
                    <a href="https://sepolia-optimism.etherscan.io/address/${token}" 
                       target="_blank" 
                       class="font-mono text-blue-600 hover:text-blue-800">
                        ${token}
                    </a>
                    <button onclick="removePaymentToken('${token}')" 
                            class="text-red-500 hover:text-red-700">
                        Remove
                    </button>
                </div>
            `).join('');
        }
        showMessage('Payment tokens retrieved successfully');
    } catch (error) {
        if (error.message.includes('missing revert data')) {
            showError('Failed to get payment tokens: Contract function not available');
        } else {
            showError(error.message || 'Failed to get payment tokens');
        }
    }
}

async function removePaymentToken(tokenAddress) {
    try {
        if (!heroNFTContract) {
            throw new Error('Contract not initialized');
        }

        const tx = await heroNFTContract.removePaymentToken(tokenAddress);
        showMessage('Removing payment token... Please wait for confirmation');
        await tx.wait();
        showMessage('Payment token removed successfully');
        
        // Refresh the payment tokens list
        await getPaymentTokens();
    } catch (error) {
        showError(error);
    }
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // MetaMask is locked or the user has not connected any accounts
        console.log('Please connect to MetaMask.');
    } else if (accounts[0] !== connectedAddress) {
        connectedAddress = accounts[0];
        updateWalletUI();
    }
} 