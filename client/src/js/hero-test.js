import { ethers } from 'ethers';
import { heroNFTAbi } from './abi/heroNFT.js';
import { heroMetadataAbi } from './abi/heroMetadata.js';
import { heroAbi } from './abi/hero.js';
import { heroConfig } from '../config/hero.js';
import { initNFTContract } from './nft-contract-test.js';

// Export functions for use in HTML
window.connectWallet = connectWallet;
window.createHero = createHero;
window.loadNFTsFromContract = loadNFTsFromContract;
window.mintNFT = mintNFT;
window.mintWithToken = () => mintNFT(true);
window.mintWithEth = () => mintNFT(false);
window.batchMintWithToken = () => batchMintNFT(true);
window.batchMintWithEth = () => batchMintNFT(false);
window.checkNftRegistration = checkNftRegistration;
window.checkTokenExists = checkTokenExists;
window.checkTokenApproval = checkTokenApproval;
window.getAcceptedTokens = getAcceptedTokens;
window.getDefaultPaymentToken = getDefaultPaymentToken;
window.getDefaultNativePrice = getDefaultNativePrice;
window.getDefaultTokenPrice = getDefaultTokenPrice;
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
    const eventLog = getElement('eventLog');
    if (eventLog) {
        const logEntry = document.createElement('div');
        logEntry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        eventLog.appendChild(logEntry);
        eventLog.scrollTop = eventLog.scrollHeight;
    }
}

export async function showMessage(message, duration = 3000) {
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

export function showError(message, error = null) {
    const errorMessage = error ? `${message}: ${error.message}` : message;
    console.error(errorMessage);
    showMessage(`Error: ${errorMessage}`, 5000);
    logEvent(`Error: ${errorMessage}`);
}

export function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
    }
    return element;
}

export function setInputValue(id, value) {
    const element = getElement(id);
    if (element && element instanceof HTMLInputElement) {
        element.value = value;
    }
}

export function validateNumber(value) {
    const num = Number(value);
    return !Number.isNaN(num) && num > 0;
}

export function validateAddress(address) {
    return address && ethers.isAddress(address);
}

// Modified loadRegisteredNFTs function
async function loadRegisteredNFTs() {
    try {
        const nftList = getElement('nftList');
        if (!nftList) return;

        nftList.innerHTML = '';
        
        if (!heroContract || !heroNFTContract) {
            showError('Contracts not initialized');
            return;
        }

        // Get list of registered NFT contracts and remove duplicates
        const registeredNFTs = await heroContract.getRegisteredNFTs();
        const uniqueNFTs = [...new Set(registeredNFTs.map(addr => addr.toLowerCase()))];
        
        if (uniqueNFTs.length === 0) {
            nftList.innerHTML = '<p class="text-gray-500">No registered NFT contracts found</p>';
            return;
        }

        // Create container for registered NFTs
        const contractsContainer = document.createElement('div');
        contractsContainer.className = 'space-y-4';

        // Process each unique registered NFT contract
        for (const contractAddress of uniqueNFTs) {
            try {
                const nftContract = new ethers.Contract(
                    contractAddress,
                    heroNFTAbi,
                    signer
                );

                // Check first 20 token IDs
                const maxTokenId = 20;
                for (let tokenId = 1; tokenId <= maxTokenId; tokenId++) {
                    try {
                        const exists = await nftContract.exists(tokenId);
                        if (!exists) continue;

                        const owner = await nftContract.ownerOf(tokenId);
                        if (owner.toLowerCase() === connectedAddress.toLowerCase()) {
                            // Check if hero exists for this NFT
                            let heroInfo = null;
                            try {
                                heroInfo = await heroContract.getHeroInfo(contractAddress, tokenId);
                            } catch (error) {
                                // Hero doesn't exist for this NFT
                                console.log(`No hero found for NFT ${tokenId} at ${contractAddress}`);
                            }

                            const nftItem = document.createElement('div');
                            nftItem.className = 'bg-white p-4 rounded-lg shadow flex flex-col space-y-2';
                            
                            if (heroInfo) {
                                // Display hero information
                                nftItem.innerHTML = `
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <span class="font-semibold">Contract: ${contractAddress}</span><br>
                                            <span class="text-sm">Token ID: ${tokenId}</span>
                                        </div>
                                    </div>
                                    <div class="text-sm text-gray-600">
                                        <p>Hero Name: ${heroInfo.name}</p>
                                        <p>Race: ${heroInfo.race}</p>
                                        <p>Level: ${heroInfo.level}</p>
                                        <p>Experience: ${heroInfo.experience}</p>
                                    </div>
                                `;
                            } else {
                                // Display create hero button
                                nftItem.innerHTML = `
                                    <div class="flex justify-between items-center">
                                        <div>
                                            <span class="font-semibold">Contract: ${contractAddress}</span><br>
                                            <span class="text-sm">Token ID: ${tokenId}</span>
                                        </div>
                                        <button onclick="prepareCreateHero('${contractAddress}', ${tokenId})" 
                                                class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                                            Create Hero
                                        </button>
                                    </div>
                                `;
                            }
                            contractsContainer.appendChild(nftItem);
                        }
                    } catch (error) {
                        console.error(`Error checking token ${tokenId}:`, error);
                    }
                }
            } catch (error) {
                console.error(`Error processing contract ${contractAddress}:`, error);
            }
        }

        nftList.innerHTML = '';
        if (contractsContainer.children.length === 0) {
            nftList.innerHTML = '<p class="text-gray-500">No NFTs found for connected address</p>';
        } else {
            nftList.appendChild(contractsContainer);
        }

    } catch (error) {
        console.error('Error loading registered NFTs:', error);
        showError(`Failed to load registered NFTs: ${error.message}`);
    }
}

// Modified connectWallet function
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

        // Initialize contracts
        heroContract = new ethers.Contract(heroContractAddress, heroAbi, signer);
        heroNFTContract = new ethers.Contract(nftContractAddress, heroNFTAbi, signer);

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

        // Get registered NFTs from hero contract
        const registeredNFTs = await heroContract.getRegisteredNFTs();
        window.registeredNFTs = registeredNFTs; // Store for later use

        // Enable wallet-required buttons
        for (const button of document.querySelectorAll('.requires-wallet')) {
            button.disabled = false;
        }

        // Load NFTs
        await loadRegisteredNFTs();
        showMessage('Wallet connected successfully');
        
        return true;
    } catch (error) {
        showError('Failed to connect wallet:', error);
        return false;
    }
}

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
                    try {
                        await heroContract.getHeroInfo(contractAddress, tokenId);
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

// 创建英雄
async function createHero() {
    try {
        const contractAddress = getElement('heroNFTContract').value;
        const tokenId = Number(getElement('heroTokenId').value);
        const name = getElement('heroName').value;
        const race = Number(getElement('heroRace').value);
        const gender = Number(getElement('heroGender').value);

        // 基本验证
        if (!contractAddress || !tokenId || !name || !race) {
            showError('Please fill in all required hero details');
            return;
        }

        // 验证数值
        if (!validateNumber(tokenId) || !validateNumber(race) || !validateNumber(gender)) {
            showError('Invalid number values provided');
            return;
        }

        // 验证 NFT 所有权
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

        // 创建英雄
        const tx = await heroContract.createHero(
            contractAddress,
            tokenId,
            name,
            race,
            gender || 0 // 如果性别未指定，默认为 0
        );

        showMessage('Creating hero... Please wait for transaction confirmation');
        await tx.wait();
        showMessage('Hero created successfully!');

        // 重新加载 NFT 列表
        await loadNFTsFromContract(contractAddress);
    } catch (error) {
        console.error('Error creating hero:', error);
        showError(`Failed to create hero: ${error.message}`);
    }
}

// 显示 NFT 列表
function displayNFTs(nfts) {
    const nftList = document.getElementById('nftList');
    const currentContent = nftList.innerHTML;
    
    const newContent = `
        <div class="mt-4">
            <h3 class="font-semibold mb-2">Found NFTs:</h3>
            ${nfts.map(nft => `
                <div class="flex items-center justify-between border-b py-2">
                    <div>
                        <span class="font-semibold">Token ID: ${nft.tokenId.toString()}</span>
                        ${nft.hasHero ? `
                            <div class="text-sm text-gray-600">
                                <div>Name: ${nft.heroInfo.name}</div>
                                <div>Race: ${nft.heroInfo.race}</div>
                                <div>Level: ${nft.heroInfo.level}</div>
                            </div>
                        ` : `
                            <div class="text-sm text-yellow-600">
                                <button onclick="prepareCreateHero('${nft.contractAddress}', ${nft.tokenId})" 
                                        class="text-blue-500 hover:text-blue-700">
                                    Create Hero for this NFT
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // 保留合约列表，添加 NFT 列表
    const contractListEnd = currentContent.indexOf('<div class="mt-4">');
    const baseContent = contractListEnd !== -1 ? currentContent.substring(0, contractListEnd) : currentContent;
    nftList.innerHTML = baseContent + newContent;
}

// 准备创建英雄
async function prepareCreateHero(contractAddress, tokenId) {
    try {
        // Set the values in the create hero form
        setInputValue('heroNFTContract', contractAddress);
        setInputValue('heroTokenId', tokenId);
        
        // Scroll to the create hero section
        const createHeroSection = getElement('createHeroSection');
        if (createHeroSection) {
            createHeroSection.scrollIntoView({ behavior: 'smooth' });
            showMessage('Ready to create hero. Please fill in the remaining details.');
        } else {
            showError('Create hero section not found');
        }
    } catch (error) {
        showError('Failed to prepare hero creation:', error);
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