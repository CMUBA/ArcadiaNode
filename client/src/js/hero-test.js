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
window.loadNFTsFromContract = loadNFTsFromContract;
window.mintNFT = mintNFT;
window.prepareCreateHero = prepareCreateHero;

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

// Modified loadRegisteredNFTs function
async function loadRegisteredNFTs() {
    try {
        console.log('Loading registered NFTs...');
        console.log('Config loaded:', heroConfig);
        console.log('NFT contract address:', heroConfig.ethereum.contracts.heroNFT);
        
        if (!heroContract || !heroNFTContract) {
            console.log('Initializing contracts...');
            await initContract();
        }

        const nfts = [];
        const nftContractAddress = heroConfig.ethereum.contracts.heroNFT;

        // Poll first 20 token IDs
        for (let i = 1; i <= 20; i++) {
            try {
                const owner = await heroNFTContract.ownerOf(i);
                if (owner) {
                    // Check if hero exists and get hero info
                    let heroExists = false;
                    let heroInfo = null;
                    try {
                        heroInfo = await heroContract.getHeroInfo(nftContractAddress, i);
                        heroExists = true;
                        console.log(`Hero exists for token ${i}:`, heroInfo);
                    } catch (error) {
                        console.log(`No hero exists for token ${i}:`, error.message);
                        heroExists = false;
                    }

                    nfts.push({
                        tokenId: i,
                        owner: owner,
                        heroExists: heroExists,
                        heroInfo: heroExists ? {
                            name: heroInfo[0],
                            race: Number(heroInfo[1]),
                            gender: Number(heroInfo[2]),
                            level: Number(heroInfo[3]),
                            energy: Number(heroInfo[4]),
                            dailyPoints: Number(heroInfo[5])
                        } : null
                    });
                }
            } catch (error) {
                // Token doesn't exist, skip to next
                if (error.message.includes('owner query for nonexistent token')) {
                    continue;
                }
                console.error(`Error checking token ${i}:`, error);
            }
        }

        // Update UI
        const nftListElement = document.getElementById('nftList');
        if (nftListElement) {
            if (nfts.length > 0) {
                nftListElement.innerHTML = nfts.map(nft => `
                    <div class="p-2 bg-gray-50 rounded mb-2">
                        <p>Token ID: ${nft.tokenId}</p>
                        <p>Owner: <a href="https://sepolia-optimism.etherscan.io/address/${nft.owner}" 
                                   target="_blank" 
                                   class="text-blue-600 hover:text-blue-800 break-all">
                            ${nft.owner}
                        </a></p>
                        ${nft.heroExists ? 
                            `<div class="mt-2">
                                <p class="text-green-500">Hero exists</p>
                                <div class="mt-1 text-sm">
                                    <p>Name: ${nft.heroInfo.name}</p>
                                    <p>Race: ${nft.heroInfo.race}</p>
                                    <p>Gender: ${nft.heroInfo.gender}</p>
                                    <p>Level: ${nft.heroInfo.level}</p>
                                    <p>Energy: ${nft.heroInfo.energy}</p>
                                    <p>Daily Points: ${nft.heroInfo.dailyPoints}</p>
                                </div>
                            </div>` : 
                            `<button onclick="prepareCreateHero('${nftContractAddress}', ${nft.tokenId})"
                                     class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-2">
                                Create Hero
                            </button>`
                        }
                    </div>
                `).join('');
            } else {
                nftListElement.innerHTML = '<p class="text-gray-500">No NFTs found</p>';
            }
        }
    } catch (error) {
        console.error('Error loading NFTs:', error);
        showError(error);
    }
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

        showMessage('Wallet connected successfully');

        // Load NFTs after successful connection
        logEvent('Loading registered NFTs...');
        await loadRegisteredNFTs();
        
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
        console.log('Preparing to create hero with:', {
            providedContractAddress: contractAddress,
            tokenId,
            configAddress: heroConfig.ethereum.contracts.heroNFT,
            heroConfig: heroConfig
        });

        // 如果没有提供合约地址，使用配置中的地址
        const nftContractAddress = heroConfig.ethereum.contracts.heroNFT;
        console.log('NFT contract address55:', nftContractAddress);
        if (!nftContractAddress || !ethers.isAddress(nftContractAddress)) {
            console.error('Invalid contract address:', {
                provided: contractAddress,
                fromConfig: heroConfig.ethereum.contracts.heroNFT
            });
            throw new Error('Invalid contract address');
        }

        if (!validateNumber(tokenId)) {
            throw new Error('Invalid token ID');
        }

        // Verify NFT ownership
        logEvent('Verifying NFT ownership...');
        const nftContract = new ethers.Contract(nftContractAddress, heroNFTAbi, signer);
        const owner = await nftContract.ownerOf(tokenId);
        
        if (owner.toLowerCase() !== connectedAddress.toLowerCase()) {
            throw new Error('You do not own this NFT');
        }
        logEvent('NFT ownership verified');

        // Check if hero already exists
        logEvent('Checking if hero already exists...');
        try {
            const heroInfo = await heroContract.getHeroInfo(nftContractAddress, tokenId);
            if (heroInfo) {
                throw new Error('Hero already exists for this NFT');
            }
        } catch (error) {
            // Expected error if hero doesn't exist
            logEvent('No existing hero found, proceeding with creation');
        }

        // Set form values
        setInputValue('heroNFTContract', nftContractAddress);
        setInputValue('heroTokenId', tokenId);
        logEvent('Form values set for hero creation');

        // Scroll to create hero section
        const createHeroSection = document.getElementById('createHeroSection');
        if (createHeroSection) {
            createHeroSection.scrollIntoView({ behavior: 'smooth' });
        }

        showMessage('Ready to create hero');
    } catch (error) {
        console.error('Error in prepareCreateHero:', error);
        showError(error);
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

        // Validate contract address
        if (!validateAddress(contractAddress)) {
            showError('Invalid NFT contract address');
            return;
        }

        // Initialize NFT contract with full ABI
        const nftContract = new ethers.Contract(contractAddress, heroNFTAbi, signer);
        
        // Verify NFT ownership
        try {
            const owner = await nftContract.ownerOf(tokenId);
            if (owner.toLowerCase() !== connectedAddress.toLowerCase()) {
                showError('You do not own this NFT');
                return;
            }
        } catch (error) {
            console.error('Error checking NFT ownership:', error);
            showError('Failed to verify NFT ownership. The token may not exist.');
            return;
        }

        // Create hero
        const tx = await heroContract.createHero(
            contractAddress,
            tokenId,
            name,
            race,
            gender || 0
        );

        showMessage('Creating hero... Please wait for transaction confirmation');
        const receipt = await tx.wait();
        
        // Display transaction hash
        const txHashInfo = document.getElementById('txHashInfo');
        const txHashLink = document.getElementById('txHashLink');
        if (txHashInfo && txHashLink) {
            txHashLink.href = `https://sepolia-optimism.etherscan.io/tx/${receipt.hash}`;
            txHashLink.textContent = receipt.hash;
            txHashInfo.classList.remove('hidden');
        }
        
        showMessage('Hero created successfully!');

        // Refresh NFT list
        await loadRegisteredNFTs();
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

        // Refresh NFT list
        await loadNFTsFromContract(heroNFTContract.address);
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

        // Refresh NFT list
        await loadNFTsFromContract(heroNFTContract.address);
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

// 从指定合约加载 NFT
async function loadNFTsFromContract(contractAddress) {
    try {
        const nftContract = new ethers.Contract(contractAddress, heroNFTAbi, signer);
        const balance = await nftContract.balanceOf(connectedAddress);
        const nftList = document.createElement('div');
        nftList.className = 'mt-4 space-y-2';

        for (let i = 0; i < balance; i++) {
            try {
                const tokenId = await nftContract.tokenOfOwnerByIndex(connectedAddress, i);
                const owner = await nftContract.ownerOf(tokenId);
                
                if (owner.toLowerCase() === connectedAddress.toLowerCase()) {
                    // Check if hero exists for this NFT
                    let heroExists = false;
                    let heroInfo = null;
                    try {
                        heroInfo = await heroContract.getHeroInfo(contractAddress, tokenId);
                        heroExists = true;
                    } catch (error) {
                        // Hero doesn't exist for this NFT
                        heroExists = false;
                    }

                    const nftItem = document.createElement('div');
                    nftItem.className = 'p-3 border rounded flex justify-between items-center';
                    nftItem.innerHTML = `
                        <span>Token ID: ${tokenId.toString()}</span>
                        ${!heroExists ? `
                            <button 
                                onclick="prepareCreateHero('${contractAddress}', ${tokenId})"
                                class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                            >
                                Create Hero for this NFT
                            </button>
                        ` : `
                            <span class="text-green-500">Hero Created</span>
                        `}
                    `;
                    nftList.appendChild(nftItem);
                }
            } catch (error) {
                console.error(`Error processing token ${i}:`, error);
            }
        }

        // Find the contract section and append the NFT list
        const contractSection = Array.from(document.querySelectorAll('.p-4.border.rounded-lg')).find(
            section => section.textContent.includes(contractAddress)
        );
        
        if (contractSection) {
            // Remove any existing NFT list
            const existingList = contractSection.querySelector('.mt-4.space-y-2');
            if (existingList) {
                existingList.remove();
            }
            contractSection.appendChild(nftList);
        }

    } catch (error) {
        console.error('Error loading NFTs:', error);
        showError(`Failed to load NFTs: ${error.message}`);
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

        // Validate inputs
        if (!validateAddress(nftContract)) {
            showError('Invalid NFT contract address');
            return;
        }

        if (!validateNumber(tokenId)) {
            showError('Invalid token ID');
            return;
        }

        if (!name || name.trim() === '') {
            showError('Name is required');
            return;
        }

        if (!validateNumber(race) || race < 0 || race > 4) {
            showError('Invalid race value (must be 0-4)');
            return;
        }

        if (gender !== undefined && (gender < 0 || gender > 1)) {
            showError('Invalid gender value (must be 0-1)');
            return;
        }

        // Create hero on-chain first
        const tx = await heroContract.createHero(
            nftContract,
            tokenId,
            name,
            race,
            gender || 0
        );

        showMessage('Creating hero on-chain... Please wait for confirmation');
        const receipt = await tx.wait();
        showMessage('Hero created on-chain successfully!');

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
                gender: gender || 0,
                transactionHash: receipt.hash
            })
        });

        const result = await response.json();
        
        // Display result
        const apiResponse = document.getElementById('apiResponse');
        if (apiResponse) {
            apiResponse.textContent = JSON.stringify(result, null, 2);
            apiResponse.classList.remove('hidden');
        }
        
        if (result.error) {
            showError(result.error);
        } else {
            showMessage('Hero created and verified successfully via API');
        }
    } catch (error) {
        console.error('API test failed:', error);
        showError(`API test failed: ${error.message}`);
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

        // Validate inputs
        if (!validateAddress(nftContract)) {
            showError('Invalid NFT contract address');
            return;
        }

        if (!validateNumber(tokenId)) {
            showError('Invalid token ID');
            return;
        }

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
        
        // Display result
        const apiResponse = document.getElementById('apiResponse');
        if (apiResponse) {
            apiResponse.textContent = JSON.stringify(result, null, 2);
            apiResponse.classList.remove('hidden');
        }
        
        if (result.error) {
            showError(result.error);
        } else {
            showMessage('Hero loaded successfully via API');
            
            // Update form with hero data if available
            if (result.data) {
                setInputValue('heroName', result.data.name);
                setInputValue('heroRace', result.data.race);
                setInputValue('heroGender', result.data.gender);
            }
        }
    } catch (error) {
        console.error('API test failed:', error);
        showError(`API test failed: ${error.message}`);
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

        // Validate inputs
        if (!validateAddress(nftContract)) {
            showError('Invalid NFT contract address');
            return;
        }

        if (!validateNumber(tokenId)) {
            showError('Invalid token ID');
            return;
        }

        if (!name || name.trim() === '') {
            showError('Name is required');
            return;
        }

        if (!validateNumber(race) || race < 0 || race > 4) {
            showError('Invalid race value (must be 0-4)');
            return;
        }

        if (gender !== undefined && (gender < 0 || gender > 1)) {
            showError('Invalid gender value (must be 0-1)');
            return;
        }

        // Save hero on-chain first
        const tx = await heroContract.saveHeroFullData(
            nftContract,
            tokenId,
            {
                name,
                race,
                gender: gender || 0,
                level: 1,
                energy: 100,
                dailyPoints: 10
            }
        );

        showMessage('Saving hero on-chain... Please wait for confirmation');
        const receipt = await tx.wait();
        showMessage('Hero saved on-chain successfully!');

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
                    gender: gender || 0,
                    level: 1,
                    energy: 100,
                    dailyPoints: 10
                },
                transactionHash: receipt.hash
            })
        });

        const result = await response.json();
        
        // Display result
        const apiResponse = document.getElementById('apiResponse');
        if (apiResponse) {
            apiResponse.textContent = JSON.stringify(result, null, 2);
            apiResponse.classList.remove('hidden');
        }
        
        if (result.error) {
            showError(result.error);
        } else {
            showMessage('Hero saved and verified successfully via API');
        }
    } catch (error) {
        console.error('API test failed:', error);
        showError(`API test failed: ${error.message}`);
    }
}

async function initHeroContract() {
    try {
        if (!window.ethereum) {
            throw new Error('MetaMask is not installed');
        }

        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        heroContract = new ethers.Contract(heroContractAddress, heroAbi, signer);
        
        return true;
    } catch (error) {
        console.error('Error initializing hero contract:', error);
        return false;
    }
} 