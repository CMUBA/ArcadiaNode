import { ethers } from 'ethers';
import { heroNFTAbi } from './abi/heroNFT.js';
import config from '../config/hero.js';

// Utility functions
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id ${id} not found`);
    }
    return element;
}

function showMessage(message) {
    const messageArea = getElement('messageArea');
    if (messageArea) {
        messageArea.textContent = message;
        messageArea.className = 'text-green-500';
    }
}

function showError(error) {
    const messageArea = getElement('messageArea');
    if (messageArea) {
        messageArea.textContent = error.message || error;
        messageArea.className = 'text-red-500';
    }
    console.error(error);
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

// Export functions for use in HTML
window.connectWallet = connectWallet;
window.mintNFT = mintNFT;
window.batchMintNFT = batchMintNFT;
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

// Add event listener for page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        if (window.ethereum?.selectedAddress) {
            await connectWallet();
        }
        await updateContractInfo();
        await checkWalletConnection();
    } catch (error) {
        console.error('Error during page initialization:', error);
        showError(error);
    }
}); 