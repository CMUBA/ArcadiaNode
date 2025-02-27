import { ethers } from 'ethers';
import { heroNFTAbi } from './abi/heroNFT.js';
import { heroMetadataAbi } from './abi/heroMetadata.js';
import { heroAbi } from './abi/hero-v6.js';
import { heroConfig } from '../config/hero.js';

// Validation helper functions
function validateAddress(address) {
    try {
        return ethers.isAddress(address);
    } catch (error) {
        return false;
    }
}

function validateNumber(num) {
    return !Number.isNaN(Number(num)) && Number.isInteger(Number(num)) && Number(num) > 0;
}

function setInputValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
        element.value = value;
    }
}

// Export functions for use in HTML
window.connectWallet = connectWallet;
window.createHero = createHero;
window.mintNFT = mintNFT;
window.prepareCreateHero = prepareCreateHero;
window.getHeroInfo = getHeroInfo;
window.updateHeroSkill = updateHeroSkill;
window.updateEquipment = updateEquipment;
window.addDailyPoints = addDailyPoints;
window.consumeEnergy = consumeEnergy;
window.getHeroSkills = getHeroSkills;
window.checkNftRegistration = checkNftRegistration;
window.getOfficialNFT = getOfficialNFT;
window.checkTokenExists = checkTokenExists;
window.checkTokenApproval = checkTokenApproval;
window.getAcceptedTokens = getAcceptedTokens;
window.getDefaultPaymentToken = getDefaultPaymentToken;
window.getDefaultNativePrice = getDefaultNativePrice;
window.getDefaultTokenPrice = getDefaultTokenPrice;

// Contract initialization
let provider;
let signer;
let connectedAddress;
let heroNFTContract;
let heroMetadataContract;
let heroContract;

// Contract addresses from config
const {
    hero: heroContractAddress,
    heroMetadata: metadataContractAddress,
    heroNFT: nftContractAddress
} = heroConfig.ethereum.contracts;

// Export utility functions
export function logEvent(message) {
    console.log(`[Event] ${message}`); // Add console logging
    const eventLog = document.getElementById('eventLog');
    if (eventLog) {
        const logEntry = document.createElement('div');
        logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        eventLog.appendChild(logEntry);
        eventLog.scrollTop = eventLog.scrollHeight;
    }
}

export function showMessage(message, duration = 3000) {
    console.log(`[Message] ${message}`); // Add console logging
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.classList.remove('hidden');
        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, duration);
    }
    logEvent(message);
}

export function showError(error) {
    const errorMessage = error.message || error.toString();
    console.error(`[Error] ${errorMessage}`);
    showMessage(`Error: ${errorMessage}`, 5000);
    logEvent(`Error: ${errorMessage}`);
}

// Add MetaMask detection
function checkMetaMask() {
    if (typeof window.ethereum === 'undefined') {
        showError('MetaMask is not installed. Please install MetaMask to use this application.');
        return false;
    }
    return true;
}

// Add network check
async function checkNetwork() {
    try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== '0xaa37dc') { // Optimism Sepolia
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xaa37dc' }],
            });
        }
        return true;
    } catch (error) {
        if (error.code === 4902) {
            try {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: '0xaa37dc',
                        chainName: 'Optimism Sepolia',
                        nativeCurrency: {
                            name: 'ETH',
                            symbol: 'ETH',
                            decimals: 18
                        },
                        rpcUrls: ['https://sepolia.optimism.io'],
                        blockExplorerUrls: ['https://sepolia-optimism.etherscan.io']
                    }]
                });
                return true;
            } catch (addError) {
                showError('Failed to add Optimism Sepolia network', addError);
                return false;
            }
        }
        showError('Failed to switch network', error);
        return false;
    }
}

// Modified connectWallet function
async function connectWallet() {
    try {
        console.log('Attempting to connect wallet...');
        logEvent('Attempting to connect wallet...');

        if (!checkMetaMask()) {
            return;
        }

        // Check if MetaMask is locked
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        console.log('Current accounts:', accounts);
        
        if (!accounts || accounts.length === 0) {
            logEvent('MetaMask is locked - requesting account access...');
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            logEvent('Account access granted');
        }

        // Check and switch network if needed
        if (!await checkNetwork()) {
            return;
        }

        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        console.log('Got signer:', await signer.getAddress());
        logEvent('Got signer from provider');

        // Initialize contracts
        console.log('Initializing contracts...');
        logEvent('Initializing contracts...');
        
        try {
            heroContract = new ethers.Contract(heroContractAddress, heroAbi, signer);
            console.log('Hero contract initialized:', await heroContract.getAddress());
            
            heroNFTContract = new ethers.Contract(nftContractAddress, heroNFTAbi, signer);
            console.log('HeroNFT contract initialized:', await heroNFTContract.getAddress());
            
            heroMetadataContract = new ethers.Contract(metadataContractAddress, heroMetadataAbi, signer);
            console.log('HeroMetadata contract initialized:', await heroMetadataContract.getAddress());
        } catch (error) {
            console.error('Contract initialization error:', error);
            throw error;
        }

        connectedAddress = await signer.getAddress();
        console.log('Connected wallet address:', connectedAddress);
        logEvent(`Connected wallet address: ${connectedAddress}`);

        // Update UI
        const connectWalletBtn = document.getElementById('connectWallet');
        const connectedWalletDiv = document.getElementById('connectedWallet');
        const walletAddressSpan = document.getElementById('walletAddress');
        
        if (connectWalletBtn && connectedWalletDiv && walletAddressSpan) {
            connectWalletBtn.textContent = 'Connected';
            connectWalletBtn.classList.add('bg-green-500', 'hover:bg-green-600');
            connectWalletBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            connectedWalletDiv.classList.remove('hidden');
            walletAddressSpan.textContent = connectedAddress;
        }

        // Enable buttons that require wallet connection
        for (const button of document.querySelectorAll('.requires-wallet')) {
            button.disabled = false;
        }

        // Add MetaMask event listeners
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);

        // Update contract information after successful connection
        await updateContractInfo();
        
        showMessage('Wallet connected successfully');
        
    } catch (error) {
        console.error('Wallet connection error:', error);
        showError('Failed to connect wallet', error);
        
        // Reset UI state on error
        const connectWalletBtn = document.getElementById('connectWallet');
        if (connectWalletBtn) {
            connectWalletBtn.textContent = 'Connect Wallet';
            connectWalletBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
            connectWalletBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
        }
        for (const button of document.querySelectorAll('.requires-wallet')) {
            button.disabled = true;
        }
    }
}

// Handle account changes
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        showMessage('Please connect to MetaMask.');
        // Reset UI
        const connectWalletBtn = document.getElementById('connectWallet');
        if (connectWalletBtn) {
            connectWalletBtn.textContent = 'Connect Wallet';
            connectWalletBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
            connectWalletBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
        }
        for (const button of document.querySelectorAll('.requires-wallet')) {
            button.disabled = true;
        }
    } else if (accounts[0] !== connectedAddress) {
        connectedAddress = accounts[0];
        showMessage(`Account changed to: ${accounts[0]}`);
        document.getElementById('walletAddress').textContent = accounts[0];
    }
}

// Handle chain changes
function handleChainChanged() {
    window.location.reload();
}

// Add DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded - initializing event listeners...'); // Add console logging
    logEvent('Page loaded - wallet connection ready');
    
    // Add click event listener to connect wallet button
    const connectWalletBtn = document.getElementById('connectWallet');
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWallet);
        console.log('Added click listener to connect wallet button');
    }
});

// Prepare create hero
async function prepareCreateHero(contractAddress, tokenId) {
    try {
        logEvent(`Preparing to create hero for NFT - Contract: ${contractAddress}, TokenId: ${tokenId}`);

        if (!validateAddress(contractAddress)) {
            throw new Error('Invalid contract address');
        }

        if (!validateNumber(tokenId)) {
            throw new Error('Invalid token ID');
        }

        // Verify NFT ownership
        logEvent('Verifying NFT ownership...');
        const nftContract = new ethers.Contract(contractAddress, heroNFTAbi, signer);
        const owner = await nftContract.ownerOf(tokenId);
        
        if (owner.toLowerCase() !== connectedAddress.toLowerCase()) {
            throw new Error('You do not own this NFT');
        }
        logEvent('NFT ownership verified');

        // Check if hero already exists
        logEvent('Checking if hero already exists...');
        try {
            const heroInfo = await heroContract.getHeroInfo(contractAddress, tokenId);
            if (heroInfo) {
                throw new Error('Hero already exists for this NFT');
            }
        } catch (error) {
            // Expected error if hero doesn't exist
            logEvent('No existing hero found, proceeding with creation');
        }

        // Set form values
        setInputValue('heroNFTContract', contractAddress);
        setInputValue('heroTokenId', tokenId);
        logEvent('Form values set for hero creation');

        // Scroll to create hero section
        const createHeroSection = document.getElementById('createHeroSection');
        if (createHeroSection) {
            createHeroSection.scrollIntoView({ behavior: 'smooth' });
        }

        showMessage('Ready to create hero');
    } catch (error) {
        console.error('Error preparing hero creation:', error);
        showError('Failed to prepare hero creation', error);
        logEvent(`Failed to prepare hero creation: ${error.message}`);
    }
}

// Create hero
async function createHero() {
    try {
        const contractAddress = document.getElementById('heroNFTContract').value;
        const tokenId = Number(document.getElementById('heroTokenId').value);
        const name = document.getElementById('heroName').value;
        const race = Number(document.getElementById('heroRace').value);
        const gender = Number(document.getElementById('heroGender').value);

        // Basic validation
        if (!contractAddress || !tokenId || !name || !race) {
            showError('Please fill in all required hero details');
            return;
        }

        // Validate numbers
        if (!validateNumber(tokenId) || !validateNumber(race) || !validateNumber(gender)) {
            showError('Invalid number values provided');
            return;
        }

        // Verify NFT ownership
        const nftContract = new ethers.Contract(
            contractAddress,
            ['function ownerOf(uint256) view returns (address)'],
            signer
        );

        const owner = await nftContract.ownerOf(tokenId);
        if (owner.toLowerCase() !== connectedAddress.toLowerCase()) {
            showError('You do not own this NFT');
            return;
        }

        // Create hero
        const tx = await heroContract.createHero(
            contractAddress,
            tokenId,
            name,
            race,
            gender || 0 // Default to 0 if gender not specified
        );

        showMessage('Creating hero... Please wait for transaction confirmation');
        const receipt = await tx.wait();
        
        // Display transaction hash with Etherscan link
        const txHashInfo = document.getElementById('txHashInfo');
        const txHashLink = document.getElementById('txHashLink');
        if (txHashInfo && txHashLink) {
            txHashLink.href = `https://sepolia-optimism.etherscan.io/tx/${receipt.hash}`;
            txHashLink.textContent = receipt.hash;
            txHashInfo.classList.remove('hidden');
        }
        
        showMessage('Hero created successfully!');
    } catch (error) {
        console.error('Error creating hero:', error);
        showError(`Failed to create hero: ${error.message}`);
    }
}

// Mint NFT function
async function mintNFT(useToken = false) {
    try {
        const tokenId = Number(document.getElementById('mintTokenId').value);
        
        if (!tokenId || Number.isNaN(tokenId)) {
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
        const tokenIds = document.getElementById('batchTokenIds').value
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
    try {
        const tokenId = Number(document.getElementById('priceConfigTokenId').value);
        const tokenAddress = document.getElementById('priceConfigTokenAddress').value;
        const price = document.getElementById('priceConfigAmount').value;

        if (!tokenId || Number.isNaN(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }
        if (!tokenAddress || !ethers.isAddress(tokenAddress)) {
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
        const tokenId = Number(document.getElementById('priceConfigTokenId').value);
        if (!tokenId || Number.isNaN(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }

        const config = await heroNFTContract.getPriceConfig(tokenId);
        document.getElementById('priceConfigInfo').textContent = 
            `Token Address: ${config.tokenAddress}\n` +
            `Price: ${ethers.formatUnits(config.price, 18)}\n` +
            `Active: ${config.isActive}`;
        showMessage('Price configuration retrieved successfully');
    } catch (error) {
        showError(`Failed to get price config: ${error.message}`);
    }
}

// Hero Management Functions

async function getHeroInfo() {
    try {
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

        try {
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
            if (error.message.includes('Hero does not exist')) {
                const heroInfoElement = document.getElementById('heroInfo');
                if (heroInfoElement) {
                    heroInfoElement.textContent = `No hero exists for NFT Contract ${nftContract} and Token ID ${tokenId}`;
                }
                showMessage('No hero found for this NFT');
            } else {
                throw error;
            }
        }
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
    try {
        const tokenId = Number(document.getElementById('tokenId').value);
        if (!tokenId || Number.isNaN(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }

        const exists = await heroNFTContract.exists(tokenId);
        document.getElementById('tokenInfo').textContent = `Token ${tokenId} ${exists ? 'exists' : 'does not exist'}`;
        showMessage('Token existence checked successfully');
    } catch (error) {
        showError(`Failed to check token existence: ${error.message}`);
    }
}

async function checkTokenApproval() {
    try {
        const tokenId = Number(document.getElementById('tokenId').value);
        const operator = document.getElementById('operatorAddress').value;

        if (!tokenId || Number.isNaN(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }
        if (!operator || !ethers.isAddress(operator)) {
            showError('Please enter a valid operator address');
            return;
        }

        const isApproved = await heroNFTContract.isApprovedForToken(operator, tokenId);
        document.getElementById('tokenInfo').textContent = 
            `Operator ${operator} is ${isApproved ? 'approved' : 'not approved'} for token ${tokenId}`;
        showMessage('Token approval checked successfully');
    } catch (error) {
        showError(`Failed to check token approval: ${error.message}`);
    }
}

async function getAcceptedTokens() {
    try {
        const tokenId = Number(document.getElementById('tokenId').value);
        if (!tokenId || Number.isNaN(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }

        const tokens = await heroNFTContract.getAcceptedTokens(tokenId);
        document.getElementById('tokenInfo').textContent = 
            `Accepted tokens for token ${tokenId}:\n${tokens.join('\n')}`;
        showMessage('Accepted tokens retrieved successfully');
    } catch (error) {
        showError(`Failed to get accepted tokens: ${error.message}`);
    }
}

// Default Payment Settings
async function getDefaultPaymentToken() {
    try {
        const token = await heroNFTContract.getDefaultPaymentToken();
        document.getElementById('defaultPaymentToken').value = token;
        showMessage('Default payment token retrieved successfully');
    } catch (error) {
        showError(`Failed to get default payment token: ${error.message}`);
    }
}

async function getDefaultNativePrice() {
    try {
        const price = await heroNFTContract.getDefaultNativePrice();
        document.getElementById('defaultNativePrice').value = ethers.formatEther(price);
        showMessage('Default native price retrieved successfully');
    } catch (error) {
        showError(`Failed to get default native price: ${error.message}`);
    }
}

async function getDefaultTokenPrice() {
    try {
        const price = await heroNFTContract.getDefaultTokenPrice();
        document.getElementById('defaultTokenPrice').value = ethers.formatUnits(price, 18);
        showMessage('Default token price retrieved successfully');
    } catch (error) {
        showError(`Failed to get default token price: ${error.message}`);
    }
}

async function validateTokenIds(tokenIds) {
    if (!Array.isArray(tokenIds)) return false;
    
    for (const id of tokenIds) {
        const numId = Number(id);
        if (!numId || Number.isNaN(numId)) return false;
    }
    return true;
}

// API test functions
async function testCreateHeroAPI() {
    try {
        if (!window.ethereum?.selectedAddress) {
            showError('Please connect your wallet first');
            return;
        }

        // Get current values from form
        const nftContract = document.getElementById('heroNFTContract').value;
        const tokenId = document.getElementById('heroTokenId').value;
        const name = document.getElementById('heroName').value;
        const race = document.getElementById('heroRace').value;
        const gender = document.getElementById('heroGender').value;

        // Create message to sign
        const message = `Create Hero: ${nftContract}-${tokenId}`;
        const signature = await signer.signMessage(message);

        // Make API call
        const response = await fetch('/api/hero/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
                'message': message,
                'address': await signer.getAddress()
            },
            body: JSON.stringify({
                nftContract,
                tokenId,
                name,
                race,
                gender
            })
        });

        const result = await response.json();
        document.getElementById('apiResponse').textContent = JSON.stringify(result, null, 2);
        
        if (result.error) {
            showError(result.error);
        } else {
            showMessage('Hero created successfully via API');
        }
    } catch (error) {
        showError('API test failed:', error);
    }
}

async function testLoadHeroAPI() {
    try {
        if (!window.ethereum?.selectedAddress) {
            showError('Please connect your wallet first');
            return;
        }

        // Get current values from form
        const nftContract = document.getElementById('heroNFTContract').value;
        const tokenId = document.getElementById('heroTokenId').value;

        // Create message to sign
        const message = `Load Hero: ${nftContract}-${tokenId}`;
        const signature = await signer.signMessage(message);

        // Make API call
        const response = await fetch(`/api/hero/${nftContract}/${tokenId}`, {
            method: 'GET',
            headers: {
                'signature': signature,
                'message': message,
                'address': await signer.getAddress()
            }
        });

        const result = await response.json();
        document.getElementById('apiResponse').textContent = JSON.stringify(result, null, 2);
        
        if (result.error) {
            showError(result.error);
        } else {
            showMessage('Hero loaded successfully via API');
        }
    } catch (error) {
        showError('API test failed:', error);
    }
}

async function testSaveHeroAPI() {
    try {
        if (!window.ethereum?.selectedAddress) {
            showError('Please connect your wallet first');
            return;
        }

        // Get current values from form
        const nftContract = document.getElementById('heroNFTContract').value;
        const tokenId = document.getElementById('heroTokenId').value;
        const name = document.getElementById('heroName').value;
        const race = document.getElementById('heroRace').value;
        const gender = document.getElementById('heroGender').value;

        // Create message to sign
        const message = `Save Hero: ${nftContract}-${tokenId}`;
        const signature = await signer.signMessage(message);

        // Make API call
        const response = await fetch('/api/hero/save', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'signature': signature,
                'message': message,
                'address': await signer.getAddress()
            },
            body: JSON.stringify({
                nftContract,
                tokenId,
                heroData: {
                    name,
                    race,
                    gender,
                    level: '1'
                }
            })
        });

        const result = await response.json();
        document.getElementById('apiResponse').textContent = JSON.stringify(result, null, 2);
        
        if (result.error) {
            showError(result.error);
        } else {
            showMessage('Hero saved successfully via API');
        }
    } catch (error) {
        showError('API test failed:', error);
    }
}

async function initHeroContract() {
    try {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        
        console.log('Initializing hero contract with address:', heroContractAddress);
        heroContract = new ethers.Contract(heroContractAddress, heroAbi, signer);
        
        console.log('Initializing heroNFT contract with address:', nftContractAddress);
        heroNFTContract = new ethers.Contract(nftContractAddress, heroNFTAbi, signer);
        
        console.log('Initializing heroMetadata contract with address:', metadataContractAddress);
        heroMetadataContract = new ethers.Contract(metadataContractAddress, heroMetadataAbi, signer);
        
        return true;
    } catch (error) {
        console.error('Error initializing hero contract:', error);
        return false;
    }
}

async function updateContractInfo() {
    try {
        if (!heroContract) {
            console.log('Initializing hero contract...');
            await initHeroContract();
        }

        console.log('Updating contract information...');

        // Get contract address
        const contractAddress = await heroContract.getAddress();
        setInputValue('contractAddress', contractAddress);
        console.log('Contract address:', contractAddress);

        // Get contract version
        const version = await heroContract.VERSION();
        setInputValue('contractVersion', version);
        console.log('Contract version:', version);

        // Get owner address
        const owner = await heroContract.owner();
        setInputValue('ownerAddress', owner);
        console.log('Owner address:', owner);

        // Get registered NFTs
        const registeredNFTs = await heroContract.getRegisteredNFTs();
        const registeredNFTsElement = document.getElementById('registeredNFTs');
        if (registeredNFTsElement) {
            registeredNFTsElement.innerHTML = registeredNFTs.map(nft => `
                <div class="mb-1">
                    <a href="https://sepolia-optimism.etherscan.io/address/${nft}" 
                       target="_blank" 
                       class="text-blue-600 hover:text-blue-800 break-all">
                        ${nft}
                    </a>
                </div>
            `).join('') || 'No registered NFTs';
        }
        console.log('Registered NFTs:', registeredNFTs);

        // Get total heroes
        try {
            console.log('Attempting to get total heroes...');
            console.log('Hero contract address:', heroContractAddress);
            
            // 确保使用正确的 ABI
            const totalHeroesAbi = [
                "function totalHeroes() view returns (uint256)"
            ];
            
            // 创建一个专门用于调用 totalHeroes 的合约实例
            const totalHeroesContract = new ethers.Contract(
                heroContractAddress,
                totalHeroesAbi,
                provider
            );
            
            // 调用 totalHeroes 函数
            const totalHeroes = await totalHeroesContract.totalHeroes();
            const totalHeroesElement = document.getElementById('totalHeroes');
            if (totalHeroesElement) {
                totalHeroesElement.textContent = totalHeroes.toString();
            }
            console.log('Total heroes:', totalHeroes.toString());
        } catch (error) {
            console.error('Error getting total heroes:', error);
            // 如果 totalHeroes 函数调用失败，设置为 "N/A"
            const totalHeroesElement = document.getElementById('totalHeroes');
            if (totalHeroesElement) {
                totalHeroesElement.textContent = "N/A";
            }
        }

        showMessage('Contract information updated successfully');
    } catch (error) {
        console.error('Error updating contract information:', error);
        showError(error);
    }
}