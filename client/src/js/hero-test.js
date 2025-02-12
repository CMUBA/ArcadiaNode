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

        // 请求连接到 Optimism Sepolia
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa37dc' }],
        });

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

        // 自动加载注册的 NFT 合约列表
        await loadRegisteredNFTs();
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
    try {
        const name = document.getElementById('heroName').value.trim();
        const race = document.getElementById('heroRace').value;
        const gender = document.getElementById('heroGender').value;
        const contractAddress = document.getElementById('heroNFTContract').value;
        const tokenId = document.getElementById('heroTokenId').value;

        if (!name || !race || !contractAddress || !tokenId) {
            throw new Error('Please fill in all required fields');
        }

        const tx = await heroContract.createHero(
            contractAddress,
            tokenId,
            name,
            race,
            gender
        );

        showMessage('Creating hero...');
        await tx.wait();
        showMessage('Hero created successfully');
        
        // 刷新 NFT 列表
        await loadNFTsFromContract(contractAddress);
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

// 加载注册的 NFT 合约列表
async function loadRegisteredNFTs() {
    try {
        const nftList = document.getElementById('nftList');
        nftList.innerHTML = '<p>Loading registered NFT contracts...</p>';
        
        // 从合约获取注册的 NFT 合约列表
        const registeredNFTs = await heroContract.getRegisteredNFTs();
        
        if (!registeredNFTs || registeredNFTs.length === 0) {
            nftList.innerHTML = '<p>No registered NFT contracts found</p>';
            return;
        }
        
        // 显示合约列表
        nftList.innerHTML = `
            <div class="space-y-4">
                <h3 class="font-semibold">Registered NFT Contracts:</h3>
                ${registeredNFTs.map(nftAddress => `
                    <div class="flex items-center justify-between border-b py-2">
                        <span class="font-mono text-sm">${nftAddress}</span>
                        <button onclick="loadNFTsFromContract('${nftAddress}')"
                                class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                            Load NFTs
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    } catch (error) {
        showError('Failed to load NFT contracts:', error);
        nftList.innerHTML = '<p class="text-red-500">Error loading NFT contracts</p>';
    }
}

// 从指定合约加载 NFT
async function loadNFTsFromContract(contractAddress) {
    try {
        const nftContract = new ethers.Contract(
            contractAddress,
            heroNFTAbi, // 使用完整的 ABI
            signer
        );
        
        // 获取用户拥有的 NFT 数量
        const balance = await nftContract.balanceOf(connectedAddress);
        const balanceNumber = Number(balance);
        
        if (balanceNumber === 0) {
            showMessage(`No NFTs found in contract ${contractAddress}`);
            return;
        }
        
        // 获取所有 NFT 并检查是否注册了英雄
        const nfts = [];
        for (let i = 0; i < balanceNumber; i++) {
            try {
                const tokenId = await nftContract.tokenOfOwnerByIndex(connectedAddress, i);
                let hasHero = false;
                let heroInfo = null;
                
                try {
                    // 使用 try-catch 检查 NFT 是否已注册为英雄
                    heroInfo = await heroContract.getHeroInfo(contractAddress, tokenId);
                    hasHero = true;
                } catch (e) {
                    // NFT 未注册为英雄，这是正常情况
                    console.log(`NFT ${tokenId} is not registered as hero yet`);
                }
                
                nfts.push({
                    tokenId: Number(tokenId), // 确保 tokenId 是数字
                    contractAddress,
                    hasHero,
                    heroInfo
                });
            } catch (e) {
                console.error(`Error loading NFT at index ${i}:`, e);
                // 继续处理下一个 NFT
                continue;
            }
        }
        
        if (nfts.length > 0) {
            displayNFTs(nfts);
        } else {
            showMessage(`No NFTs found in contract ${contractAddress}`);
        }
    } catch (error) {
        console.error('Error details:', error);
        if (error.code === 'CALL_EXCEPTION') {
            showError(`Contract ${contractAddress} does not support required NFT functions`, error);
        } else {
            showError(`Failed to load NFTs from contract ${contractAddress}`, error);
        }
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
function prepareCreateHero(contractAddress, tokenId) {
    document.getElementById('heroNFTContract').value = contractAddress;
    document.getElementById('heroTokenId').value = tokenId;
    
    const createHeroSection = document.getElementById('createHeroSection');
    if (createHeroSection) {
        createHeroSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    showMessage('Please fill in hero details and click Create Hero');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // 禁用需要钱包的按钮
    document.querySelectorAll('.requires-wallet').forEach(button => {
        button.disabled = true;
    });
    
    // 添加事件监听器
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
});

// 将函数添加到全局作用域
window.loadNFTsFromContract = loadNFTsFromContract;
window.prepareCreateHero = prepareCreateHero; 