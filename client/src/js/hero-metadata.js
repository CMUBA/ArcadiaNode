import { ethers } from 'ethers';
import { heroMetadataAbi } from './abi/heroMetadata.js';
import { heroConfig } from '../config/hero.js';

// Contract initialization
let provider;
let signer;
let connectedAddress;
let heroMetadataContract;

// Contract addresses from config
const { heroMetadata: metadataContractAddress } = heroConfig.ethereum.contracts;

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

// Contract functions
async function updateContractInfo() {
    try {
        setInputValue('contractAddress', metadataContractAddress);
        
        if (heroMetadataContract) {
            const owner = await heroMetadataContract.owner();
            setInputValue('ownerAddress', owner);
        }
    } catch (error) {
        console.error('Error updating contract info:', error);
        showError(`Failed to update contract info: ${error.message}`);
    }
}

// Skill Management
async function setSkill() {
    try {
        const skillId = Number(getElement('skillId').value);
        const seasonId = Number(getElement('seasonId').value);
        const level = Number(getElement('skillLevel').value);
        const name = getElement('skillName').value;
        const points = Number(getElement('skillPoints').value);

        if (!validateNumber(skillId) || !validateNumber(seasonId) || !validateNumber(level)) {
            showError('Please enter valid numbers for skill ID, season ID, and level');
            return;
        }
        if (!name) {
            showError('Please enter a skill name');
            return;
        }
        if (!validateNumber(points)) {
            showError('Please enter valid points');
            return;
        }

        const tx = await heroMetadataContract.setSkill(seasonId, skillId, level, name, points, true);
        showMessage('Setting skill... Please wait for confirmation');
        await tx.wait();
        showMessage('Skill set successfully');
    } catch (error) {
        showError('Failed to set skill:', error);
    }
}

async function getSkill() {
    try {
        const skillId = Number(getElement('skillId').value);
        const seasonId = Number(getElement('seasonId').value);
        const level = Number(getElement('skillLevel').value);

        if (!validateNumber(skillId) || !validateNumber(seasonId) || !validateNumber(level)) {
            showError('Please enter valid numbers for skill ID, season ID, and level');
            return;
        }

        const skill = await heroMetadataContract.getSkill(seasonId, skillId, level);
        getElement('skillInfo').textContent = 
            `Name: ${skill.name}\nLevel: ${skill.level}\nPoints: ${skill.points}\nSeason: ${skill.season}\nActive: ${skill.isActive}`;
        showMessage('Skill retrieved successfully');
    } catch (error) {
        showError('Failed to get skill:', error);
    }
}

// Race Management
async function setRace() {
    try {
        const raceId = Number(getElement('raceId').value);
        const name = getElement('raceName').value;
        const description = getElement('raceDescription').value;
        
        // Get base attributes
        const baseAttributes = [
            Number(getElement('raceStr').value),
            Number(getElement('raceDex').value),
            Number(getElement('raceInt').value),
            Number(getElement('raceVit').value)
        ];

        if (!validateNumber(raceId)) {
            showError('Please enter a valid race ID');
            return;
        }
        if (!name) {
            showError('Please enter a race name');
            return;
        }
        if (baseAttributes.some(attr => !validateNumber(attr))) {
            showError('Please enter valid numbers for all base attributes');
            return;
        }

        const tx = await heroMetadataContract.setRace(raceId, baseAttributes, description, true);
        showMessage('Setting race... Please wait for confirmation');
        await tx.wait();
        showMessage('Race set successfully');
    } catch (error) {
        showError('Failed to set race:', error);
    }
}

async function getRace() {
    try {
        const raceId = Number(getElement('raceId').value);
        if (!validateNumber(raceId)) {
            showError('Please enter a valid race ID');
            return;
        }

        const race = await heroMetadataContract.getRace(raceId);
        getElement('raceInfo').textContent = 
            `Base Attributes: [${race.baseAttributes.join(', ')}]\nDescription: ${race.description}\nActive: ${race.isActive}`;
        showMessage('Race retrieved successfully');
    } catch (error) {
        showError('Failed to get race:', error);
    }
}

// Class Management
async function setClass() {
    try {
        const classId = Number(getElement('classId').value);
        const name = getElement('className').value;
        const description = getElement('classDescription').value;
        
        // Get base attributes
        const baseAttributes = [
            Number(getElement('classStr').value),
            Number(getElement('classDex').value),
            Number(getElement('classInt').value),
            Number(getElement('classVit').value)
        ];

        // Get growth rates
        const growthRates = [
            Number(getElement('classStrGrowth').value),
            Number(getElement('classDexGrowth').value),
            Number(getElement('classIntGrowth').value),
            Number(getElement('classVitGrowth').value)
        ];

        if (!validateNumber(classId)) {
            showError('Please enter a valid class ID');
            return;
        }
        if (!name) {
            showError('Please enter a class name');
            return;
        }
        if (baseAttributes.some(attr => !validateNumber(attr))) {
            showError('Please enter valid numbers for all base attributes');
            return;
        }
        if (growthRates.some(rate => !validateNumber(rate))) {
            showError('Please enter valid numbers for all growth rates');
            return;
        }

        const tx = await heroMetadataContract.setClass(classId, baseAttributes, growthRates, description, true);
        showMessage('Setting class... Please wait for confirmation');
        await tx.wait();
        showMessage('Class set successfully');
    } catch (error) {
        showError('Failed to set class:', error);
    }
}

async function getClass() {
    try {
        const classId = Number(getElement('classId').value);
        if (!validateNumber(classId)) {
            showError('Please enter a valid class ID');
            return;
        }

        const classInfo = await heroMetadataContract.getClass(classId);
        getElement('classInfo').textContent = 
            `Base Attributes: [${classInfo.baseAttributes.join(', ')}]\nGrowth Rates: [${classInfo.growthRates.join(', ')}]\nDescription: ${classInfo.description}\nActive: ${classInfo.isActive}`;
        showMessage('Class retrieved successfully');
    } catch (error) {
        showError('Failed to get class:', error);
    }
}

// Load current metadata state
async function loadMetadataState() {
    try {
        if (!heroMetadataContract) {
            console.log('Contract not initialized yet');
            return;
        }

        // Load skills
        const skillsContainer = document.createElement('div');
        skillsContainer.className = 'space-y-2';
        
        for (let season = 0; season < 4; season++) {
            for (let skillId = 0; skillId < 5; skillId++) {
                for (let level = 1; level <= 10; level++) {
                    try {
                        const skill = await heroMetadataContract.getSkill(season, skillId, level);
                        if (skill.isActive) {
                            const skillDiv = document.createElement('div');
                            skillDiv.className = 'p-2 border rounded';
                            skillDiv.textContent = `Season ${season}, Skill ${skillId}, Level ${level}: ${skill.name} (${skill.points} points)`;
                            skillsContainer.appendChild(skillDiv);
                        }
                    } catch (error) {
                        console.log(`No skill found for season ${season}, id ${skillId}, level ${level}`);
                    }
                }
            }
        }
        
        const skillInfo = getElement('skillInfo');
        if (skillInfo) {
            skillInfo.innerHTML = '<h3 class="font-semibold mb-2">Registered Skills:</h3>';
            skillInfo.appendChild(skillsContainer);
        }

        // Load races
        const racesContainer = document.createElement('div');
        racesContainer.className = 'space-y-2';
        
        for (let raceId = 0; raceId < 10; raceId++) {
            try {
                const race = await heroMetadataContract.getRace(raceId);
                if (race.isActive) {
                    const raceDiv = document.createElement('div');
                    raceDiv.className = 'p-2 border rounded';
                    raceDiv.textContent = `Race ${raceId}: Base Attributes [${race.baseAttributes.join(', ')}], ${race.description}`;
                    racesContainer.appendChild(raceDiv);
                }
            } catch (error) {
                console.log(`No race found for id ${raceId}`);
            }
        }
        
        const raceInfo = getElement('raceInfo');
        if (raceInfo) {
            raceInfo.innerHTML = '<h3 class="font-semibold mb-2">Registered Races:</h3>';
            raceInfo.appendChild(racesContainer);
        }

        // Load classes
        const classesContainer = document.createElement('div');
        classesContainer.className = 'space-y-2';
        
        for (let classId = 0; classId < 10; classId++) {
            try {
                const classInfo = await heroMetadataContract.getClass(classId);
                if (classInfo.isActive) {
                    const classDiv = document.createElement('div');
                    classDiv.className = 'p-2 border rounded';
                    classDiv.textContent = `Class ${classId}: Base Attributes [${classInfo.baseAttributes.join(', ')}], Growth Rates [${classInfo.growthRates.join(', ')}], ${classInfo.description}`;
                    classesContainer.appendChild(classDiv);
                }
            } catch (error) {
                console.log(`No class found for id ${classId}`);
            }
        }
        
        const classInfoElement = getElement('classInfo');
        if (classInfoElement) {
            classInfoElement.innerHTML = '<h3 class="font-semibold mb-2">Registered Classes:</h3>';
            classInfoElement.appendChild(classesContainer);
        }

    } catch (error) {
        console.error('Error loading metadata state:', error);
        showError('Failed to load metadata state:', error);
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
        heroMetadataContract = new ethers.Contract(metadataContractAddress, heroMetadataAbi, signer);

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
            connectWalletBtn.classList.add('bg-green-500');
            connectWalletBtn.classList.remove('bg-blue-500');
        }

        // Enable wallet-required buttons
        for (const button of document.querySelectorAll('.requires-wallet')) {
            button.disabled = false;
        }

        await updateContractInfo();
        await loadMetadataState();
        showMessage('Wallet connected successfully');
    } catch (error) {
        showError('Failed to connect wallet:', error);
    }
}

// Export functions for use in HTML
window.connectWallet = connectWallet;
window.setSkill = setSkill;
window.getSkill = getSkill;
window.setRace = setRace;
window.getRace = getRace;
window.setClass = setClass;
window.getClass = getClass;

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