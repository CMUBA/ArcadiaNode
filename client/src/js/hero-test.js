import { ethers } from 'ethers';
import { heroNFTAbi } from './abi/heroNFT.js';
import { heroMetadataAbi } from './abi/heroMetadata.js';
import { heroAbi } from './abi/hero.js';
import { heroConfig } from '../config/hero.js';

let provider;
let signer;
let heroNFTContract;
let heroMetadataContract;
let heroContract;
let connectedAddress;

// 移除环境变量引用，直接使用 heroConfig
const heroContractAddress = heroConfig.ethereum.contracts.hero;
const nftContractAddress = heroConfig.ethereum.contracts.heroNFT;
const metadataContractAddress = heroConfig.ethereum.contracts.heroMetadata;

// Event logging
function logEvent(message) {
    const eventLog = document.getElementById('eventLog');
    const logEntry = document.createElement('div');
    logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    eventLog.appendChild(logEntry);
    eventLog.scrollTop = eventLog.scrollHeight;
}

// Utility Functions
function showMessage(message) {
    console.log(message);
    // Add UI notification if needed
}

function showError(message, error) {
    console.error(message, error);
    // Add UI error notification if needed
}

// Wallet connection
async function connectWallet() {
    try {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        connectedAddress = await signer.getAddress();

        // Initialize contracts
        heroNFTContract = new ethers.Contract(nftContractAddress, heroNFTAbi, signer);
        heroMetadataContract = new ethers.Contract(metadataContractAddress, heroMetadataAbi, signer);
        heroContract = new ethers.Contract(heroContractAddress, heroAbi, signer);

        document.getElementById('walletAddress').textContent = connectedAddress;
        document.getElementById('connectedWallet').classList.remove('hidden');
        
        // Enable wallet-required buttons
        document.querySelectorAll('.requires-wallet').forEach(button => {
            button.disabled = false;
        });

        showMessage('Wallet connected successfully');
    } catch (error) {
        showError('Failed to connect wallet:', error);
    }
}

// NFT Management Functions
async function mintNFT(useToken = false) {
    const tokenId = document.getElementById('mintTokenId').value;
    
    try {
        let tx;
        if (useToken) {
            const defaultToken = await heroNFTContract.getDefaultPaymentToken();
            tx = await heroNFTContract.mintWithToken(connectedAddress, tokenId, defaultToken);
        } else {
            const price = await heroNFTContract.getDefaultNativePrice();
            tx = await heroNFTContract.mint(connectedAddress, tokenId, { value: price });
        }
        await tx.wait();
        showMessage('NFT minted successfully');
    } catch (error) {
        showError('Failed to mint NFT:', error);
    }
}

async function batchMintNFT(useToken = false) {
    const tokenIds = document.getElementById('batchTokenIds').value.split(',').map(id => id.trim());
    
    try {
        let tx;
        if (useToken) {
            const defaultToken = await heroNFTContract.getDefaultPaymentToken();
            tx = await heroNFTContract.mintBatchWithToken(connectedAddress, tokenIds, defaultToken);
        } else {
            const price = await heroNFTContract.getDefaultNativePrice();
            const totalPrice = price * BigInt(tokenIds.length);
            tx = await heroNFTContract.mintBatch(connectedAddress, tokenIds, { value: totalPrice });
        }
        await tx.wait();
        showMessage('Batch NFT minting successful');
    } catch (error) {
        showError('Failed to mint batch NFTs:', error);
    }
}

async function burnNFT() {
    const tokenId = document.getElementById('burnTokenId').value;
    
    try {
        const tx = await heroNFTContract.burn(tokenId);
        await tx.wait();
        showMessage('NFT burned successfully');
    } catch (error) {
        showError('Failed to burn NFT:', error);
    }
}

// Price Configuration Functions
async function setPriceConfig() {
    const tokenId = document.getElementById('priceConfigTokenId').value;
    const tokenAddress = document.getElementById('priceConfigTokenAddress').value;
    const price = document.getElementById('priceConfigAmount').value;
    
    try {
        const tx = await heroNFTContract.setPriceConfig(tokenId, tokenAddress, price);
        await tx.wait();
        showMessage('Price configuration updated successfully');
    } catch (error) {
        showError('Failed to set price config:', error);
    }
}

async function getPriceConfig() {
    const tokenId = document.getElementById('priceConfigTokenId').value;
    
    try {
        const config = await heroNFTContract.getPriceConfig(tokenId);
        showMessage(`Price Config: ${JSON.stringify(config)}`);
    } catch (error) {
        showError('Failed to get price config:', error);
    }
}

// Hero Management Functions
async function createHero() {
    const name = document.getElementById('heroName').value;
    const race = document.getElementById('heroRace').value;
    const gender = document.getElementById('heroGender').value;
    const tokenId = document.getElementById('heroTokenId').value;
    
    try {
        const tx = await heroContract.createHero(nftContractAddress, tokenId, name, race, gender);
        await tx.wait();
        showMessage('Hero created successfully');
    } catch (error) {
        showError('Failed to create hero:', error);
    }
}

async function getHeroInfo() {
    const tokenId = document.getElementById('heroTokenId').value;
    
    try {
        const info = await heroContract.getHeroInfo(nftContractAddress, tokenId);
        document.getElementById('heroInfo').textContent = JSON.stringify(info, null, 2);
    } catch (error) {
        showError('Failed to get hero info:', error);
    }
}

async function updateHeroSkill() {
    const tokenId = document.getElementById('updateSkillTokenId').value;
    const season = document.getElementById('updateSkillSeason').value;
    const skillIndex = document.getElementById('updateSkillIndex').value;
    const level = document.getElementById('updateSkillLevel').value;
    
    try {
        const tx = await heroContract.updateSkill(nftContractAddress, tokenId, season, skillIndex, level);
        await tx.wait();
        showMessage('Hero skill updated successfully');
    } catch (error) {
        showError('Failed to update hero skill:', error);
    }
}

async function updateEquipment() {
    const tokenId = document.getElementById('updateEquipTokenId').value;
    const slot = document.getElementById('updateEquipSlot').value;
    const equipContract = document.getElementById('updateEquipContract').value;
    const equipTokenId = document.getElementById('updateEquipTokenIdEquip').value;
    
    try {
        const tx = await heroContract.updateEquipment(nftContractAddress, tokenId, slot, equipContract, equipTokenId);
        await tx.wait();
        showMessage('Equipment updated successfully');
    } catch (error) {
        showError('Failed to update equipment:', error);
    }
}

// Daily Points and Energy Management
async function addDailyPoints() {
    const tokenId = document.getElementById('pointsEnergyTokenId').value;
    const amount = document.getElementById('pointsEnergyAmount').value;
    
    try {
        const tx = await heroContract.addDailyPoints(nftContractAddress, tokenId, amount);
        await tx.wait();
        showMessage('Daily points added successfully');
    } catch (error) {
        showError('Failed to add daily points:', error);
    }
}

async function consumeEnergy() {
    const tokenId = document.getElementById('pointsEnergyTokenId').value;
    const amount = document.getElementById('pointsEnergyAmount').value;
    
    try {
        const tx = await heroContract.consumeEnergy(nftContractAddress, tokenId, amount);
        await tx.wait();
        showMessage('Energy consumed successfully');
    } catch (error) {
        showError('Failed to consume energy:', error);
    }
}

// Hero Skills
async function getHeroSkills() {
    const tokenId = document.getElementById('heroSkillsTokenId').value;
    const season = document.getElementById('heroSkillsSeason').value;
    
    try {
        const skills = await heroContract.getHeroSkills(nftContractAddress, tokenId, season);
        document.getElementById('heroSkillsInfo').textContent = JSON.stringify(skills, null, 2);
    } catch (error) {
        showError('Failed to get hero skills:', error);
    }
}

// NFT Registration
async function checkNftRegistration() {
    const nftAddress = document.getElementById('nftContractAddress').value;
    
    try {
        const isRegistered = await heroContract.isRegistered(nftAddress);
        document.getElementById('nftRegistrationInfo').textContent = `NFT Contract ${nftAddress} is ${isRegistered ? 'registered' : 'not registered'}`;
    } catch (error) {
        showError('Failed to check NFT registration:', error);
    }
}

async function getRegisteredNFTs() {
    try {
        const nfts = await heroContract.getRegisteredNFTs();
        document.getElementById('nftRegistrationInfo').textContent = JSON.stringify(nfts, null, 2);
    } catch (error) {
        showError('Failed to get registered NFTs:', error);
    }
}

async function getOfficialNFT() {
    try {
        const officialNFT = await heroContract.officialNFT();
        document.getElementById('nftRegistrationInfo').textContent = `Official NFT: ${officialNFT}`;
    } catch (error) {
        showError('Failed to get official NFT:', error);
    }
}

// Token Existence and Approvals
async function checkTokenExists() {
    const tokenId = document.getElementById('tokenExistsId').value;
    
    try {
        const exists = await heroNFTContract.exists(tokenId);
        document.getElementById('tokenExistsInfo').textContent = `Token ${tokenId} ${exists ? 'exists' : 'does not exist'}`;
    } catch (error) {
        showError('Failed to check token existence:', error);
    }
}

async function checkTokenApproval() {
    const tokenId = document.getElementById('tokenExistsId').value;
    const operator = document.getElementById('operatorAddress').value;
    
    try {
        const isApproved = await heroNFTContract.isApprovedForToken(operator, tokenId);
        document.getElementById('tokenExistsInfo').textContent = `Operator ${operator} is ${isApproved ? 'approved' : 'not approved'} for token ${tokenId}`;
    } catch (error) {
        showError('Failed to check token approval:', error);
    }
}

async function getAcceptedTokens() {
    const tokenId = document.getElementById('tokenExistsId').value;
    
    try {
        const tokens = await heroNFTContract.getAcceptedTokens(tokenId);
        document.getElementById('tokenExistsInfo').textContent = JSON.stringify(tokens, null, 2);
    } catch (error) {
        showError('Failed to get accepted tokens:', error);
    }
}

// Default Payment Settings
async function getDefaultPaymentToken() {
    try {
        const token = await heroNFTContract.getDefaultPaymentToken();
        document.getElementById('defaultPaymentInfo').textContent = `Default Payment Token: ${token}`;
    } catch (error) {
        showError('Failed to get default payment token:', error);
    }
}

async function getDefaultNativePrice() {
    try {
        const price = await heroNFTContract.getDefaultNativePrice();
        document.getElementById('defaultPaymentInfo').textContent = `Default Native Price: ${ethers.formatEther(price)} ETH`;
    } catch (error) {
        showError('Failed to get default native price:', error);
    }
}

async function getDefaultTokenPrice() {
    try {
        const price = await heroNFTContract.getDefaultTokenPrice();
        document.getElementById('defaultPaymentInfo').textContent = `Default Token Price: ${ethers.formatUnits(price, 18)}`;
    } catch (error) {
        showError('Failed to get default token price:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Disable all buttons except connect wallet
    const buttons = document.querySelectorAll('.requires-wallet');
    for (const button of buttons) {
        button.disabled = true;
    }

    // Add event listeners
    const addListener = (id, handler) => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('click', handler);
        }
    };

    // Wallet Connection
    addListener('connectWallet', connectWallet);
    
    // NFT Management
    addListener('mintWithEth', () => mintNFT(false));
    addListener('mintWithToken', () => mintNFT(true));
    addListener('batchMintWithEth', () => batchMintNFT(false));
    addListener('batchMintWithToken', () => batchMintNFT(true));
    addListener('burnNFT', burnNFT);
    
    // Price Configuration
    addListener('setPriceConfig', setPriceConfig);
    addListener('getPriceConfig', getPriceConfig);
    
    // Hero Management
    addListener('createHero', createHero);
    addListener('getHeroInfo', getHeroInfo);
    addListener('updateHeroSkill', updateHeroSkill);
    addListener('updateEquipment', updateEquipment);
    
    // Daily Points and Energy
    addListener('addDailyPoints', addDailyPoints);
    addListener('consumeEnergy', consumeEnergy);
    
    // Hero Skills
    addListener('getHeroSkills', getHeroSkills);
    
    // NFT Registration
    addListener('checkNftRegistration', checkNftRegistration);
    addListener('getRegisteredNFTs', getRegisteredNFTs);
    addListener('getOfficialNFT', getOfficialNFT);
    
    // Token Existence and Approvals
    addListener('checkTokenExists', checkTokenExists);
    addListener('checkTokenApproval', checkTokenApproval);
    addListener('getAcceptedTokens', getAcceptedTokens);
    
    // Default Payment Settings
    addListener('getDefaultPaymentToken', getDefaultPaymentToken);
    addListener('getDefaultNativePrice', getDefaultNativePrice);
    addListener('getDefaultTokenPrice', getDefaultTokenPrice);
}); 