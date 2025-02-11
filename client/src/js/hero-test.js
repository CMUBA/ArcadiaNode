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

// Event logging
function logEvent(message) {
    const eventLog = document.getElementById('eventLog');
    const logEntry = document.createElement('div');
    logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
    eventLog.appendChild(logEntry);
    eventLog.scrollTop = eventLog.scrollHeight;
}

// Wallet connection
async function connectWallet() {
    try {
        if (typeof window.ethereum === 'undefined') {
            throw new Error('MetaMask is not installed');
        }

        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Setup ethers
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        
        // Initialize contracts
        heroNFTContract = new ethers.Contract(heroConfig.heroNFT, heroNFTAbi, signer);
        heroMetadataContract = new ethers.Contract(heroConfig.heroMetadata, heroMetadataAbi, signer);
        heroContract = new ethers.Contract(heroConfig.hero, heroAbi, signer);

        // Update UI
        document.getElementById('walletAddress').textContent = accounts[0];
        document.getElementById('connectWallet').textContent = 'Connected';
        
        logEvent('Wallet connected successfully');
        
        // Enable all buttons
        const buttons = document.querySelectorAll('.requires-wallet');
        for (const button of buttons) {
            button.disabled = false;
        }
    } catch (error) {
        logEvent(`Error connecting wallet: ${error.message}`);
    }
}

// NFT Management Functions
async function mintNFT() {
    try {
        const tokenId = document.getElementById('mintTokenId').value;
        const tx = await heroNFTContract.mint(signer.address, tokenId);
        await tx.wait();
        logEvent(`NFT minted successfully: Token ID ${tokenId}`);
    } catch (error) {
        logEvent(`Error minting NFT: ${error.message}`);
    }
}

async function batchMintNFT() {
    try {
        const tokenIds = document.getElementById('batchMintTokenIds').value.split(',').map(id => id.trim());
        const tx = await heroNFTContract.mintBatch(signer.address, tokenIds);
        await tx.wait();
        logEvent(`Batch NFT minting successful: Token IDs ${tokenIds.join(', ')}`);
    } catch (error) {
        logEvent(`Error batch minting NFTs: ${error.message}`);
    }
}

async function mintWithToken() {
    try {
        const tokenId = document.getElementById('mintWithTokenId').value;
        const paymentToken = document.getElementById('mintPaymentToken').value;
        const tx = await heroNFTContract.mintWithToken(signer.address, tokenId, paymentToken);
        await tx.wait();
        logEvent(`NFT minted with token successfully: Token ID ${tokenId}`);
    } catch (error) {
        logEvent(`Error minting NFT with token: ${error.message}`);
    }
}

async function burnNFT() {
    try {
        const tokenId = document.getElementById('burnTokenId').value;
        const tx = await heroNFTContract.burn(tokenId);
        await tx.wait();
        logEvent(`NFT burned successfully: Token ID ${tokenId}`);
    } catch (error) {
        logEvent(`Error burning NFT: ${error.message}`);
    }
}

async function setPrice() {
    try {
        const token = document.getElementById('priceToken').value;
        const price = document.getElementById('tokenPrice').value;
        const tx = await heroNFTContract.setPrice(token, price);
        await tx.wait();
        logEvent(`Price set successfully: ${price} for token ${token}`);
    } catch (error) {
        logEvent(`Error setting price: ${error.message}`);
    }
}

async function addPaymentToken() {
    try {
        const token = document.getElementById('paymentTokenAddress').value;
        const tx = await heroNFTContract.addPaymentToken(token);
        await tx.wait();
        logEvent(`Payment token added successfully: ${token}`);
    } catch (error) {
        logEvent(`Error adding payment token: ${error.message}`);
    }
}

async function removePaymentToken() {
    try {
        const token = document.getElementById('paymentTokenAddress').value;
        const tx = await heroNFTContract.removePaymentToken(token);
        await tx.wait();
        logEvent(`Payment token removed successfully: ${token}`);
    } catch (error) {
        logEvent(`Error removing payment token: ${error.message}`);
    }
}

// Hero Management Functions
async function createHero() {
    try {
        const tokenId = document.getElementById('createHeroTokenId').value;
        const raceId = document.getElementById('createHeroRaceId').value;
        const classId = document.getElementById('createHeroClassId').value;
        const tx = await heroContract.createHero(tokenId, raceId, classId);
        await tx.wait();
        logEvent(`Hero created successfully: Token ID ${tokenId}`);
    } catch (error) {
        logEvent(`Error creating hero: ${error.message}`);
    }
}

async function setHeroSkill() {
    try {
        const tokenId = document.getElementById('heroSkillTokenId').value;
        const seasonId = document.getElementById('heroSkillSeasonId').value;
        const skillId = document.getElementById('heroSkillId').value;
        const level = document.getElementById('heroSkillLevel').value;
        const tx = await heroContract.setSkill(tokenId, seasonId, skillId, level);
        await tx.wait();
        logEvent(`Hero skill set successfully: Token ID ${tokenId}, Skill ID ${skillId}`);
    } catch (error) {
        logEvent(`Error setting hero skill: ${error.message}`);
    }
}

async function getHeroSkill() {
    try {
        const tokenId = document.getElementById('heroSkillTokenId').value;
        const seasonId = document.getElementById('heroSkillSeasonId').value;
        const skillId = document.getElementById('heroSkillId').value;
        const level = await heroContract.getSkill(tokenId, seasonId, skillId);
        logEvent(`Hero skill level: ${level}`);
    } catch (error) {
        logEvent(`Error getting hero skill: ${error.message}`);
    }
}

async function setHeroAttribute() {
    try {
        const tokenId = document.getElementById('heroAttributeTokenId').value;
        const attributeId = document.getElementById('heroAttributeId').value;
        const value = document.getElementById('heroAttributeValue').value;
        const tx = await heroContract.setAttribute(tokenId, attributeId, value);
        await tx.wait();
        logEvent(`Hero attribute set successfully: Token ID ${tokenId}, Attribute ID ${attributeId}`);
    } catch (error) {
        logEvent(`Error setting hero attribute: ${error.message}`);
    }
}

async function getHeroAttribute() {
    try {
        const tokenId = document.getElementById('heroAttributeTokenId').value;
        const attributeId = document.getElementById('heroAttributeId').value;
        const value = await heroContract.getAttribute(tokenId, attributeId);
        logEvent(`Hero attribute value: ${value}`);
    } catch (error) {
        logEvent(`Error getting hero attribute: ${error.message}`);
    }
}

async function addHeroExp() {
    try {
        const tokenId = document.getElementById('heroExpTokenId').value;
        const experience = document.getElementById('heroExpValue').value;
        const tx = await heroContract.addExperience(tokenId, experience);
        await tx.wait();
        logEvent(`Hero experience added successfully: Token ID ${tokenId}, Experience ${experience}`);
    } catch (error) {
        logEvent(`Error adding hero experience: ${error.message}`);
    }
}

async function getHeroExp() {
    try {
        const tokenId = document.getElementById('heroExpTokenId').value;
        const experience = await heroContract.getExperience(tokenId);
        logEvent(`Hero experience: ${experience}`);
    } catch (error) {
        logEvent(`Error getting hero experience: ${error.message}`);
    }
}

async function getHeroLevel() {
    try {
        const tokenId = document.getElementById('heroExpTokenId').value;
        const level = await heroContract.getLevel(tokenId);
        logEvent(`Hero level: ${level}`);
    } catch (error) {
        logEvent(`Error getting hero level: ${error.message}`);
    }
}

async function consumeHeroEnergy() {
    try {
        const tokenId = document.getElementById('heroEnergyTokenId').value;
        const energy = document.getElementById('heroEnergyValue').value;
        const tx = await heroContract.consumeEnergy(tokenId, energy);
        await tx.wait();
        logEvent(`Hero energy consumed successfully: Token ID ${tokenId}, Energy ${energy}`);
    } catch (error) {
        logEvent(`Error consuming hero energy: ${error.message}`);
    }
}

async function getHeroEnergy() {
    try {
        const tokenId = document.getElementById('heroEnergyTokenId').value;
        const energy = await heroContract.getEnergy(tokenId);
        logEvent(`Hero energy: ${energy}`);
    } catch (error) {
        logEvent(`Error getting hero energy: ${error.message}`);
    }
}

// Metadata Management Functions
async function setSkillMetadata() {
    try {
        const seasonId = document.getElementById('skillSeasonId').value;
        const skillId = document.getElementById('skillId').value;
        const level = document.getElementById('skillLevel').value;
        const name = document.getElementById('skillName').value;
        const points = document.getElementById('skillPoints').value;
        const tx = await heroMetadataContract.setSkill(seasonId, skillId, level, name, points, true);
        await tx.wait();
        logEvent(`Skill metadata set successfully: Season ${seasonId}, Skill ID ${skillId}`);
    } catch (error) {
        logEvent(`Error setting skill metadata: ${error.message}`);
    }
}

async function getSkillMetadata() {
    try {
        const seasonId = document.getElementById('skillSeasonId').value;
        const skillId = document.getElementById('skillId').value;
        const level = document.getElementById('skillLevel').value;
        const skill = await heroMetadataContract.getSkill(seasonId, skillId, level);
        logEvent(`Skill metadata: ${JSON.stringify(skill)}`);
    } catch (error) {
        logEvent(`Error getting skill metadata: ${error.message}`);
    }
}

async function setRaceMetadata() {
    try {
        const raceId = document.getElementById('raceId').value;
        const baseAttributes = document.getElementById('raceBaseAttributes').value.split(',').map(attr => attr.trim());
        const description = document.getElementById('raceDescription').value;
        const tx = await heroMetadataContract.setRace(raceId, baseAttributes, description, true);
        await tx.wait();
        logEvent(`Race metadata set successfully: Race ID ${raceId}`);
    } catch (error) {
        logEvent(`Error setting race metadata: ${error.message}`);
    }
}

async function getRaceMetadata() {
    try {
        const raceId = document.getElementById('raceId').value;
        const race = await heroMetadataContract.getRace(raceId);
        logEvent(`Race metadata: ${JSON.stringify(race)}`);
    } catch (error) {
        logEvent(`Error getting race metadata: ${error.message}`);
    }
}

async function setClassMetadata() {
    try {
        const classId = document.getElementById('classId').value;
        const baseAttributes = document.getElementById('classBaseAttributes').value.split(',').map(attr => attr.trim());
        const growthRates = document.getElementById('classGrowthRates').value.split(',').map(rate => rate.trim());
        const description = document.getElementById('classDescription').value;
        const tx = await heroMetadataContract.setClass(classId, baseAttributes, growthRates, description, true);
        await tx.wait();
        logEvent(`Class metadata set successfully: Class ID ${classId}`);
    } catch (error) {
        logEvent(`Error setting class metadata: ${error.message}`);
    }
}

async function getClassMetadata() {
    try {
        const classId = document.getElementById('classId').value;
        const classData = await heroMetadataContract.getClass(classId);
        logEvent(`Class metadata: ${JSON.stringify(classData)}`);
    } catch (error) {
        logEvent(`Error getting class metadata: ${error.message}`);
    }
}

async function mintBatchWithToken() {
    try {
        const tokenIds = document.getElementById('batchTokenIds').value.split(',').map(id => id.trim());
        const paymentToken = document.getElementById('priceConfigTokenAddress').value;
        const tx = await heroNFTContract.mintBatchWithToken(signer.address, tokenIds, paymentToken);
        await tx.wait();
        logEvent(`Batch NFT minting with token successful: Token IDs ${tokenIds.join(', ')}`);
    } catch (error) {
        logEvent(`Error batch minting NFTs with token: ${error.message}`);
    }
}

async function addHeroPoints() {
    try {
        const tokenId = document.getElementById('pointsTokenId').value;
        const amount = document.getElementById('pointsAmount').value;
        const tx = await heroContract.addDailyPoints(tokenId, amount);
        await tx.wait();
        logEvent(`Daily points added successfully: Token ID ${tokenId}, Amount ${amount}`);
    } catch (error) {
        logEvent(`Error adding daily points: ${error.message}`);
    }
}

async function getPriceConfig() {
    try {
        const tokenId = document.getElementById('priceConfigTokenId').value;
        const config = await heroNFTContract.getPriceConfig(tokenId);
        logEvent(`Price config: ${JSON.stringify({
            tokenAddress: config.tokenAddress,
            price: config.price.toString(),
            isActive: config.isActive
        })}`);
    } catch (error) {
        logEvent(`Error getting price config: ${error.message}`);
    }
}

async function updateEquipment() {
    try {
        const tokenId = document.getElementById('updateEquipTokenId').value;
        const slot = document.getElementById('equipmentSlot').value;
        const equipContract = document.getElementById('equipmentContract').value;
        const equipTokenId = document.getElementById('equipmentTokenId').value;
        
        // Call the contract's updateEquipment function
        const tx = await heroContract.updateEquipment(
            heroNFTContract.address, // NFT contract address
            tokenId,
            slot,
            equipContract,
            equipTokenId
        );
        await tx.wait();
        
        logEvent(`Equipment updated successfully: Token ID ${tokenId}, Slot ${slot}`);
    } catch (error) {
        logEvent(`Error updating equipment: ${error.message}`);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
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
    addListener('mintWithEth', mintNFT);
    addListener('mintWithToken', mintWithToken);
    addListener('batchMintWithEth', batchMintNFT);
    addListener('batchMintWithToken', mintBatchWithToken);
    addListener('burnNFT', burnNFT);
    addListener('setPriceConfig', setPrice);
    addListener('getPriceConfig', getPriceConfig);
    
    // Hero Management
    addListener('createHero', createHero);
    addListener('setHeroSkill', setHeroSkill);
    addListener('getHeroSkill', getHeroSkill);
    addListener('updateHeroSkill', setHeroSkill);
    addListener('updateHeroEquipment', updateEquipment);
    addListener('consumeEnergy', consumeHeroEnergy);
    addListener('addDailyPoints', addHeroPoints);
    
    // Metadata Management
    addListener('setSkill', setSkillMetadata);
    addListener('getSkill', getSkillMetadata);
    addListener('setRace', setRaceMetadata);
    addListener('getRace', getRaceMetadata);
    addListener('setClass', setClassMetadata);
    addListener('getClass', getClassMetadata);
}); 