import { ethers } from 'ethers';
import config from '../config/index.js';
import api from '../utils/api.js';

// Contract state
let provider;
let signer;
let connectedAddress;

// Debug config
console.log('Config loaded:', config);
console.log('Hero contract address:', config.ethereum.contracts.hero);

// Utility functions
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

function showMessage(message, duration = 3000) {
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

function showError(error) {
    const errorMessage = error.message || error.toString();
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

function updateResponseDisplay(elementId, response) {
    const responseElement = getElement(elementId);
    if (responseElement) {
        responseElement.classList.remove('hidden');
        const preElement = responseElement.querySelector('pre');
        if (preElement) {
            preElement.textContent = JSON.stringify(response, null, 2);
        }
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

        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        connectedAddress = await signer.getAddress();

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

        showMessage('Wallet connected successfully');
        updateButtonStates();
        return true;
    } catch (error) {
        showError(error);
        return false;
    }
}

// API test functions
async function testCreateHero() {
    try {
        if (!provider || !signer) {
            showMessage('Please connect your wallet first', 5000);
            getElement('connectWallet').classList.add('animate-pulse');
            setTimeout(() => {
                getElement('connectWallet').classList.remove('animate-pulse');
            }, 2000);
            return;
        }

        const nftContract = getElement('createNftContract').value;
        const tokenId = getElement('createTokenId').value;
        const name = getElement('createHeroName').value;
        const race = getElement('createHeroRace').value;
        const gender = getElement('createHeroGender').value;

        // Validate inputs
        if (!nftContract || !tokenId || !name || !race) {
            throw new Error('Please fill in all required fields');
        }

        showMessage('Creating hero...');

        // Call API
        const result = await api.hero.create({
            nftContract,
            tokenId,
            name,
            race,
            gender: gender || 0
        }, signer);

        updateResponseDisplay('createHeroResponse', result);
        showMessage('Hero created successfully');
    } catch (error) {
        showError(error);
    }
}

async function testLoadHero() {
    try {
        if (!provider || !signer) {
            showMessage('Please connect your wallet first', 5000);
            getElement('connectWallet').classList.add('animate-pulse');
            setTimeout(() => {
                getElement('connectWallet').classList.remove('animate-pulse');
            }, 2000);
            return;
        }

        const nftContract = getElement('loadNftContract').value;
        const tokenId = getElement('loadTokenId').value;

        // Validate inputs
        if (!nftContract || !tokenId) {
            throw new Error('Please fill in all required fields');
        }

        showMessage('Loading hero...');

        try {
            // 尝试使用 API 加载英雄
            console.log('Attempting to load hero via API...');
            const result = await api.hero.load(nftContract, tokenId, signer);
            
            if (result?.success) {
                updateResponseDisplay('loadHeroResponse', result);
                showMessage('Hero loaded successfully');
            } else {
                throw new Error('Failed to load hero data');
            }
        } catch (apiError) {
            console.error('API load failed:', apiError);
            
            // 如果 API 调用失败，尝试直接从合约加载
            try {
                console.log('Attempting to load hero directly from contract...');
                
                // 获取合约地址
                const heroContractAddress = config.ethereum.contracts.hero;
                if (!heroContractAddress) {
                    throw new Error('Hero contract address not configured');
                }
                
                // 创建合约实例
                const heroContract = new ethers.Contract(
                    heroContractAddress,
                    [
                        "function getHeroInfo(address nftContract, uint256 tokenId) view returns (tuple(string name, uint8 race, uint8 gender, uint256 level, uint256 energy, uint256 dailyPoints))"
                    ],
                    signer
                );
                
                // 调用合约
                const heroInfo = await heroContract.getHeroInfo(nftContract, tokenId);
                console.log('Hero loaded from contract:', heroInfo);
                
                // 格式化结果
                const result = {
                    success: true,
                    hero: {
                        name: heroInfo.name,
                        race: heroInfo.race,
                        gender: heroInfo.gender,
                        level: heroInfo.level.toString(),
                        energy: heroInfo.energy.toString(),
                        dailyPoints: heroInfo.dailyPoints.toString()
                    }
                };
                
                updateResponseDisplay('loadHeroResponse', result);
                showMessage('Hero loaded successfully from contract');
            } catch (contractError) {
                console.error('Contract load failed:', contractError);
                throw new Error(`Failed to load hero: ${contractError.message}`);
            }
        }
    } catch (error) {
        showError(error);
    }
}

async function testSaveHero() {
    try {
        if (!provider || !signer) {
            showMessage('Please connect your wallet first', 5000);
            getElement('connectWallet').classList.add('animate-pulse');
            setTimeout(() => {
                getElement('connectWallet').classList.remove('animate-pulse');
            }, 2000);
            return;
        }

        const nftContract = getElement('saveNftContract').value;
        const tokenId = getElement('saveTokenId').value;
        const name = getElement('saveHeroName').value;
        const race = getElement('saveHeroRace').value;
        const gender = getElement('saveHeroGender').value;
        const level = getElement('saveHeroLevel').value;

        // Validate inputs
        if (!nftContract || !tokenId || !name || !race || !level) {
            throw new Error('Please fill in all required fields');
        }

        showMessage('Saving hero...');

        // Call API
        const result = await api.hero.save({
            nftContract,
            tokenId,
            heroData: {
                name,
                race,
                gender: gender || 0,
                level
            }
        }, signer);

        updateResponseDisplay('saveHeroResponse', result);
        showMessage('Hero saved successfully');
    } catch (error) {
        showError(error);
    }
}

// Update button states based on wallet connection
function updateButtonStates() {
    const walletButtons = document.querySelectorAll('.requires-wallet');
    for (const button of walletButtons) {
        if (!signer) {
            button.disabled = true;
            button.title = 'Please connect your wallet first';
            // Add visual indication
            button.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            button.disabled = false;
            button.title = '';
            button.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
}

// Initialize event handlers
document.addEventListener('DOMContentLoaded', () => {
    // Attach wallet connection handler
    const connectWalletBtn = getElement('connectWallet');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
    }

    // Initialize wallet-required buttons
    const walletButtons = document.querySelectorAll('.requires-wallet');
    
    // Disable buttons initially
    for (const button of walletButtons) {
        button.disabled = true;
        
        // Add hover tooltips for disabled buttons
        button.addEventListener('mouseover', () => {
            if (button.disabled) {
                showMessage('Please connect your wallet first', 2000);
            }
        });
    }

    if (window.ethereum?.selectedAddress) {
        connectWallet();
    }

    updateButtonStates();
});

// Make functions available globally for onclick handlers
window.testCreateHero = testCreateHero;
window.testLoadHero = testLoadHero;
window.testSaveHero = testSaveHero;
window.connectWallet = connectWallet; 