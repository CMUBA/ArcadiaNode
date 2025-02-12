import { ethers } from 'ethers';
import { heroNFTAbi } from './abi/heroNFT.js';
import { heroConfig } from '../config/hero.js';
import { getElement, setInputValue, showMessage, showError, validateNumber, validateAddress } from './hero-test.js';

// Export functions for use in HTML
window.mintWithToken = () => mintNFT(true);
window.mintWithEth = () => mintNFT(false);
window.batchMintWithToken = () => batchMintNFT(true);
window.batchMintWithEth = () => batchMintNFT(false);
window.checkTokenExists = checkTokenExists;
window.checkTokenApproval = checkTokenApproval;
window.getAcceptedTokens = getAcceptedTokens;
window.getDefaultPaymentToken = getDefaultPaymentToken;
window.getDefaultNativePrice = getDefaultNativePrice;
window.getDefaultTokenPrice = getDefaultTokenPrice;
window.setPriceConfig = setPriceConfig;
window.getPriceConfig = getPriceConfig;

// Contract initialization
let provider;
let signer;
let connectedAddress;
let heroNFTContract;

// Contract addresses from config
const { heroNFT: nftContractAddress } = heroConfig.ethereum.contracts;

// NFT Contract Functions
async function updateContractInfo() {
    try {
        setInputValue('contractAddress', nftContractAddress);
        
        if (heroNFTContract) {
            const version = await heroNFTContract.VERSION();
            setInputValue('contractVersion', version);
            
            const owner = await heroNFTContract.owner();
            setInputValue('ownerAddress', owner);
        }
    } catch (error) {
        console.error('Error updating contract info:', error);
        showError(`Failed to update contract info: ${error.message}`);
    }
}

// Mint NFT function
async function mintNFT(useToken = false) {
    try {
        const tokenId = Number(getElement('mintTokenId').value);
        
        if (!validateNumber(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }

        let tx;
        if (useToken) {
            const defaultToken = await heroNFTContract.getDefaultPaymentToken();
            const price = await heroNFTContract.getDefaultTokenPrice();
            tx = await heroNFTContract.mintWithToken(
                await signer.getAddress(),
                tokenId,
                defaultToken
            );
        } else {
            const price = await heroNFTContract.getDefaultNativePrice();
            tx = await heroNFTContract.mint(
                await signer.getAddress(),
                tokenId,
                { value: price }
            );
        }

        showMessage('Minting NFT... Please wait for transaction confirmation');
        await tx.wait();
        showMessage('NFT minted successfully!');
    } catch (error) {
        console.error('Error minting NFT:', error);
        showError(`Failed to mint NFT: ${error.message}`);
    }
}

async function batchMintNFT(useToken = false) {
    try {
        const tokenIds = getElement('batchTokenIds').value
            .split(',')
            .map(id => Number(id.trim()));

        if (!await validateTokenIds(tokenIds)) {
            showError('Please enter valid token IDs');
            return;
        }

        let tx;
        if (useToken) {
            const defaultToken = await heroNFTContract.getDefaultPaymentToken();
            const price = await heroNFTContract.getDefaultTokenPrice();
            const totalPrice = price * BigInt(tokenIds.length);
            tx = await heroNFTContract.mintBatchWithToken(
                await signer.getAddress(),
                tokenIds,
                defaultToken
            );
        } else {
            const price = await heroNFTContract.getDefaultNativePrice();
            const totalPrice = price * BigInt(tokenIds.length);
            tx = await heroNFTContract.mintBatch(
                await signer.getAddress(),
                tokenIds,
                { value: totalPrice }
            );
        }

        showMessage('Minting NFTs... Please wait for transaction confirmation');
        await tx.wait();
        showMessage('Batch NFT minting successful');
    } catch (error) {
        console.error('Error minting batch NFTs:', error);
        showError(`Failed to mint batch NFTs: ${error.message}`);
    }
}

async function checkTokenExists() {
    try {
        const tokenId = Number(getElement('tokenId').value);
        if (!validateNumber(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }

        const exists = await heroNFTContract.exists(tokenId);
        getElement('tokenInfo').textContent = `Token ${tokenId} ${exists ? 'exists' : 'does not exist'}`;
        showMessage('Token existence checked successfully');
    } catch (error) {
        showError(`Failed to check token existence: ${error.message}`);
    }
}

async function checkTokenApproval() {
    try {
        const tokenId = Number(getElement('tokenId').value);
        const operator = getElement('operatorAddress').value;

        if (!validateNumber(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }
        if (!validateAddress(operator)) {
            showError('Please enter a valid operator address');
            return;
        }

        const isApproved = await heroNFTContract.isApprovedForToken(operator, tokenId);
        getElement('tokenInfo').textContent = 
            `Operator ${operator} is ${isApproved ? 'approved' : 'not approved'} for token ${tokenId}`;
        showMessage('Token approval checked successfully');
    } catch (error) {
        showError(`Failed to check token approval: ${error.message}`);
    }
}

async function getAcceptedTokens() {
    try {
        const tokenId = Number(getElement('tokenId').value);
        if (!validateNumber(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }

        const tokens = await heroNFTContract.getAcceptedTokens(tokenId);
        getElement('tokenInfo').textContent = 
            `Accepted tokens for token ${tokenId}:\n${tokens.join('\n')}`;
        showMessage('Accepted tokens retrieved successfully');
    } catch (error) {
        showError(`Failed to get accepted tokens: ${error.message}`);
    }
}

async function setPriceConfig() {
    try {
        const tokenId = Number(getElement('priceConfigTokenId').value);
        const tokenAddress = getElement('priceConfigTokenAddress').value;
        const price = getElement('priceConfigAmount').value;

        if (!validateNumber(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }
        if (!validateAddress(tokenAddress)) {
            showError('Please enter a valid token address');
            return;
        }
        if (!price || Number.isNaN(Number(price))) {
            showError('Please enter a valid price amount');
            return;
        }

        const tx = await heroNFTContract.setPriceConfig(
            tokenId,
            tokenAddress,
            ethers.parseUnits(price, 18)
        );
        await tx.wait();
        showMessage('Price configuration updated successfully');
    } catch (error) {
        showError(`Failed to set price config: ${error.message}`);
    }
}

async function getPriceConfig() {
    try {
        const tokenId = Number(getElement('priceConfigTokenId').value);
        if (!validateNumber(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }

        const config = await heroNFTContract.getPriceConfig(tokenId);
        getElement('priceConfigInfo').textContent = 
            `Token Address: ${config.tokenAddress}\n` +
            `Price: ${ethers.formatUnits(config.price, 18)}\n` +
            `Active: ${config.isActive}`;
        showMessage('Price configuration retrieved successfully');
    } catch (error) {
        showError(`Failed to get price config: ${error.message}`);
    }
}

// Default Payment Settings
async function getDefaultPaymentToken() {
    try {
        const token = await heroNFTContract.getDefaultPaymentToken();
        getElement('defaultPaymentToken').value = token;
        showMessage('Default payment token retrieved successfully');
    } catch (error) {
        showError(`Failed to get default payment token: ${error.message}`);
    }
}

async function getDefaultNativePrice() {
    try {
        const price = await heroNFTContract.getDefaultNativePrice();
        getElement('defaultNativePrice').value = ethers.formatEther(price);
        showMessage('Default native price retrieved successfully');
    } catch (error) {
        showError(`Failed to get default native price: ${error.message}`);
    }
}

async function getDefaultTokenPrice() {
    try {
        const price = await heroNFTContract.getDefaultTokenPrice();
        getElement('defaultTokenPrice').value = ethers.formatUnits(price, 18);
        showMessage('Default token price retrieved successfully');
    } catch (error) {
        showError(`Failed to get default token price: ${error.message}`);
    }
}

async function validateTokenIds(tokenIds) {
    if (!Array.isArray(tokenIds)) return false;
    
    for (const id of tokenIds) {
        if (!validateNumber(id)) return false;
    }
    return true;
}

// Initialize NFT contract
export async function initNFTContract(provider, signer, address) {
    heroNFTContract = new ethers.Contract(nftContractAddress, heroNFTAbi, signer);
    connectedAddress = address;
    await updateContractInfo();
    await getDefaultPaymentToken();
    await getDefaultNativePrice();
    await getDefaultTokenPrice();
} 