import { ethers } from 'ethers';
import { heroAbi } from './abi/hero.js';
import { heroConfig } from '../config/hero.js';

// Contract initialization
let provider;
let signer;
let connectedAddress;
let heroContract;

// Contract addresses from config
const { hero: heroContractAddress } = heroConfig.ethereum.contracts;

// Utility functions
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

function setInputValue(id, value) {
    const element = getElement(id);
    if (element && (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement)) {
        element.value = value;
    }
}

async function showMessage(message, duration = 3000) {
    console.log(message);
    const messageElement = getElement('message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.classList.remove('hidden');
        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, duration);
    }
    logEvent(message);
}

function showError(message, error = null) {
    const errorMessage = error ? `${message}: ${error.message}` : message;
    console.error(errorMessage);
    showMessage(`Error: ${errorMessage}`, 5000);
    logEvent(`Error: ${errorMessage}`);
}

function logEvent(message) {
    const eventLog = getElement('eventLog');
    if (eventLog) {
        const logEntry = document.createElement('div');
        logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        eventLog.appendChild(logEntry);
        eventLog.scrollTop = eventLog.scrollHeight;
    }
}

function validateNumber(value) {
    const num = Number(value);
    return !Number.isNaN(num) && num > 0;
}

function validateAddress(address) {
    return address && ethers.isAddress(address);
}

// Contract functions
async function updateContractInfo() {
    try {
        if (!heroContract) {
            showError('Hero contract not initialized');
            return;
        }

        // 设置合约地址
        setInputValue('contractAddress', heroContractAddress);

        // 获取合约所有者
        const owner = await heroContract.owner();
        setInputValue('ownerAddress', owner);

        // 获取已注册的 NFT 列表
        const registeredNFTs = await heroContract.getRegisteredNFTs();
        const totalHeroes = document.getElementById('totalHeroes');
        if (totalHeroes) {
            // 使用自动生成的 getter 函数
            const count = await heroContract.totalHeroCount();
            totalHeroes.textContent = `Total Heroes: ${count.toString()}`;
        }

        // 显示已注册的 NFT 列表
        const registeredNFTsElement = document.getElementById('registeredNFTs');
        if (registeredNFTsElement) {
            registeredNFTsElement.innerHTML = registeredNFTs.map(addr => 
                `<div class="mb-1">${addr}</div>`
            ).join('');
        }

    } catch (error) {
        showError('Error updating contract info', error);
    }
}

// Hero Information
async function getHeroInfo() {
    try {
        // 修改这里，使用正确的元素 ID
        const nftContractInput = document.getElementById('heroNFTContract');
        const tokenIdInput = document.getElementById('heroTokenId');

        if (!nftContractInput || !tokenIdInput) {
            showError('Required input elements not found');
            return;
        }

        const nftContract = nftContractInput.value;
        const tokenId = tokenIdInput.value;

        if (!validateAddress(nftContract) || !validateNumber(tokenId)) {
            showError('Please enter valid contract address and token ID');
            return;
        }

        const info = await heroContract.getHeroInfo(nftContract, tokenId);
        
        // Convert BigInt values to strings before displaying
        const displayInfo = {
            name: info.name,
            race: info.race.toString(),
            gender: info.gender.toString(),
            level: info.level.toString(),
            energy: info.energy.toString(),
            dailyPoints: info.dailyPoints.toString()
        };

        const heroInfoElement = document.getElementById('heroInfo');
        if (heroInfoElement) {
            heroInfoElement.textContent = JSON.stringify(displayInfo, null, 2);
            showMessage('Hero info retrieved successfully');
        } else {
            showError('Hero info display element not found');
        }
    } catch (error) {
        showError('Failed to get hero info:', error);
    }
}

// Skill Management
async function updateSkill() {
    try {
        const nftContract = getElement('skillNFTContract').value;
        const tokenId = Number(getElement('skillTokenId').value);
        const season = Number(getElement('skillSeason').value);
        const skillIndex = Number(getElement('skillIndex').value);
        const level = Number(getElement('skillLevel').value);

        if (!validateAddress(nftContract)) {
            showError('Please enter a valid NFT contract address');
            return;
        }
        if (!validateNumber(tokenId) || !validateNumber(season) || 
            !validateNumber(skillIndex) || !validateNumber(level)) {
            showError('Please enter valid numbers for token ID, season, skill index, and level');
            return;
        }

        const tx = await heroContract.updateSkill(nftContract, tokenId, season, skillIndex, level);
        showMessage('Updating skill... Please wait for confirmation');
        await tx.wait();
        showMessage('Skill updated successfully');
    } catch (error) {
        showError('Failed to update skill:', error);
    }
}

async function getHeroSkills() {
    try {
        const nftContract = getElement('skillNFTContract').value;
        const tokenId = Number(getElement('skillTokenId').value);
        const season = Number(getElement('skillSeason').value);

        if (!validateAddress(nftContract)) {
            showError('Please enter a valid NFT contract address');
            return;
        }
        if (!validateNumber(tokenId) || !validateNumber(season)) {
            showError('Please enter valid numbers for token ID and season');
            return;
        }

        const skills = await heroContract.getHeroSkills(nftContract, tokenId, season);
        getElement('skillInfo').textContent = JSON.stringify(skills, null, 2);
        showMessage('Hero skills retrieved successfully');
    } catch (error) {
        showError('Failed to get hero skills:', error);
    }
}

// Equipment Management
async function updateEquipment() {
    try {
        const nftContract = getElement('equipNFTContract').value;
        const tokenId = Number(getElement('equipTokenId').value);
        const slot = Number(getElement('equipSlot').value);
        const equipContract = getElement('equipContract').value;
        const equipTokenId = Number(getElement('equipTokenIdEquip').value);

        if (!validateAddress(nftContract) || !validateAddress(equipContract)) {
            showError('Please enter valid contract addresses');
            return;
        }
        if (!validateNumber(tokenId) || !validateNumber(slot) || !validateNumber(equipTokenId)) {
            showError('Please enter valid numbers for token ID, slot, and equipment token ID');
            return;
        }

        const tx = await heroContract.updateEquipment(nftContract, tokenId, slot, equipContract, equipTokenId);
        showMessage('Updating equipment... Please wait for confirmation');
        await tx.wait();
        showMessage('Equipment updated successfully');
    } catch (error) {
        showError('Failed to update equipment:', error);
    }
}

// Points and Energy Management
async function addDailyPoints() {
    try {
        const nftContract = getElement('pointsEnergyNFTContract').value;
        const tokenId = Number(getElement('pointsEnergyTokenId').value);
        const amount = Number(getElement('pointsEnergyAmount').value);

        if (!validateAddress(nftContract)) {
            showError('Please enter a valid NFT contract address');
            return;
        }
        if (!validateNumber(tokenId) || !validateNumber(amount)) {
            showError('Please enter valid numbers for token ID and amount');
            return;
        }

        const tx = await heroContract.addDailyPoints(nftContract, tokenId, amount);
        showMessage('Adding daily points... Please wait for confirmation');
        await tx.wait();
        showMessage('Daily points added successfully');
    } catch (error) {
        showError('Failed to add daily points:', error);
    }
}

async function consumeEnergy() {
    try {
        const nftContract = getElement('pointsEnergyNFTContract').value;
        const tokenId = Number(getElement('pointsEnergyTokenId').value);
        const amount = Number(getElement('pointsEnergyAmount').value);

        if (!validateAddress(nftContract)) {
            showError('Please enter a valid NFT contract address');
            return;
        }
        if (!validateNumber(tokenId) || !validateNumber(amount)) {
            showError('Please enter valid numbers for token ID and amount');
            return;
        }

        const tx = await heroContract.consumeEnergy(nftContract, tokenId, amount);
        showMessage('Consuming energy... Please wait for confirmation');
        await tx.wait();
        showMessage('Energy consumed successfully');
    } catch (error) {
        showError('Failed to consume energy:', error);
    }
}

// NFT Registration
async function checkNftRegistration() {
    try {
        const nftAddress = getElement('nftContractAddress').value;
        
        if (!validateAddress(nftAddress)) {
            showError('Please enter a valid NFT contract address');
            return;
        }

        const isRegistered = await heroContract.isRegistered(nftAddress);
        getElement('nftRegistrationInfo').textContent = 
            `NFT Contract ${nftAddress} is ${isRegistered ? 'registered' : 'not registered'}`;
        showMessage('Registration status checked successfully');
    } catch (error) {
        showError('Failed to check NFT registration:', error);
    }
}

async function getOfficialNFT() {
    try {
        const officialNFT = await heroContract.officialNFT();
        getElement('nftRegistrationInfo').textContent = `Official NFT: ${officialNFT}`;
        showMessage('Official NFT retrieved successfully');
    } catch (error) {
        showError('Failed to get official NFT:', error);
    }
}

// Wallet connection
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

        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        connectedAddress = await signer.getAddress();

        // Initialize contract
        heroContract = new ethers.Contract(heroContractAddress, heroAbi, signer);

        // Update UI elements
        const walletAddressEl = getElement('walletAddress');
        const connectedWalletEl = getElement('connectedWallet');
        const connectWalletBtn = getElement('connectWallet');
        
        if (walletAddressEl) {
            walletAddressEl.textContent = connectedAddress;
        }
        if (connectedWalletEl) {
            connectedWalletEl.classList.remove('hidden');
        }
        if (connectWalletBtn) {
            connectWalletBtn.textContent = 'Connected';
            connectWalletBtn.classList.add('bg-green-500', 'hover:bg-green-600');
            connectWalletBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
        }

        // Enable wallet-required buttons
        const walletButtons = document.querySelectorAll('.requires-wallet');
        for (const button of walletButtons) {
            button.disabled = false;
        }

        await updateContractInfo();
        showMessage('Wallet connected successfully');
        return true;
    } catch (error) {
        showError('Failed to connect wallet:', error);
        return false;
    }
}

// Export functions for use in HTML
window.connectWallet = connectWallet;
window.getHeroInfo = getHeroInfo;
window.updateSkill = updateSkill;
window.getHeroSkills = getHeroSkills;
window.updateEquipment = updateEquipment;
window.addDailyPoints = addDailyPoints;
window.consumeEnergy = consumeEnergy;
window.checkNftRegistration = checkNftRegistration;
window.getOfficialNFT = getOfficialNFT;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Disable wallet-required buttons
    for (const button of document.querySelectorAll('.requires-wallet')) {
        button.disabled = true;
    }
    
    // Add event listeners
    const connectWalletBtn = getElement('connectWallet');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    }
}); 