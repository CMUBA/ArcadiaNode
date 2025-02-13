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
window.setDefaultNativePrice = setDefaultNativePrice;
window.setDefaultTokenPrice = setDefaultTokenPrice;
window.burnNFT = burnNFT;
window.loadNFTList = loadNFTList;
window.checkNFTPrice = checkNFTPrice;

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
        if (!window.ethereum) {
            showError('MetaMask is not installed');
            return;
        }

        // 重新初始化合约连接
        const connected = await connectWallet();
        if (!connected || !heroNFTContract || !provider || !signer) {
            showError('Contract not initialized. Please connect wallet first.');
            return;
        }

        const tokenId = Number(getElement('mintTokenId').value);
        if (!validateNumber(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }

        let tx;
        if (useToken) {
            // 使用代币铸造
            const defaultToken = await heroNFTContract.getDefaultPaymentToken();
            
            // 获取特定 tokenId 的价格配置
            const priceConfig = await heroNFTContract.getPriceConfig(tokenId);
            const price = priceConfig.isActive ? priceConfig.price : await heroNFTContract.getDefaultTokenPrice();
            
            // 显示所需支付金额
            const formattedPrice = ethers.formatUnits(price, 18);
            showMessage(`Required payment: ${formattedPrice} tokens`);
            
            // 检查代币合约
            if (defaultToken !== ethers.ZeroAddress) {
                const tokenContract = new ethers.Contract(
                    defaultToken,
                    ['function approve(address spender, uint256 amount) public returns (bool)'],
                    signer  // 使用 signer 而不是 provider
                );
                
                showMessage('Approving token transfer...');
                const approveTx = await tokenContract.approve(nftContractAddress, price);
                await approveTx.wait();
                showMessage('Token transfer approved');
            }
            
            tx = await heroNFTContract.mintWithToken(
                connectedAddress,
                tokenId,
                defaultToken
            );
        } else {
            // 使用 ETH 铸造
            const price = await heroNFTContract.getDefaultNativePrice();
            const formattedPrice = ethers.formatEther(price);
            showMessage(`Required payment: ${formattedPrice} ETH`);
            
            // 检查用户余额
            const balance = await provider.getBalance(connectedAddress);
            if (balance < price) {
                showError(`Insufficient ETH balance. You need ${formattedPrice} ETH`);
                return;
            }

            // 使用合约的 mint 函数
            tx = await heroNFTContract.mint(
                connectedAddress,  // to address
                tokenId,          // tokenId
                {
                    value: price,
                    gasLimit: 300000
                }
            );
        }

        showMessage('Minting NFT... Please wait for transaction confirmation');
        const receipt = await tx.wait();
        
        // 检查交易是否成功
        if (receipt.status === 0) {
            throw new Error('Transaction failed');
        }
        
        showMessage(`NFT minted successfully! Transaction hash: ${receipt.hash}`);
        
        // 铸造后更新余额和NFT列表
        await Promise.all([
            updateBalances(),
            loadNFTList()
        ]);
    } catch (error) {
        console.error('Error minting NFT:', error);
        
        // 详细的错误信息处理
        let errorMessage = 'Failed to mint NFT: ';
        if (error.reason) {
            errorMessage += error.reason;
        } else if (error.data?.message) {  // 使用可选链操作符
            errorMessage += error.data.message;
        } else {
            errorMessage += error.message;
        }
        
        showError(errorMessage);
        
        // 显示当前价格配置
        try {
            const nativePrice = await heroNFTContract.getDefaultNativePrice();
            const tokenPrice = await heroNFTContract.getDefaultTokenPrice();
            console.log('Current price configuration:');
            console.log('Native price:', ethers.formatEther(nativePrice), 'ETH');
            console.log('Token price:', ethers.formatUnits(tokenPrice, 18), 'tokens');
        } catch (e) {
            console.error('Error getting price configuration:', e);
        }
    }
}

async function batchMintNFT(useToken = false) {
    try {
        if (!window.ethereum) {
            showError('MetaMask is not installed');
            return;
        }

        if (!heroNFTContract) {
            // Try to reconnect wallet
            await connectWallet();
            if (!heroNFTContract) {
                showError('Contract not initialized. Please connect wallet first.');
                return;
            }
        }

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
            
            // Check if token contract needs approval
            if (defaultToken !== ethers.ZeroAddress) {
                const tokenContract = new ethers.Contract(
                    defaultToken,
                    ['function approve(address spender, uint256 amount) public returns (bool)'],
                    signer
                );
                const approveTx = await tokenContract.approve(nftContractAddress, totalPrice);
                await approveTx.wait();
            }
            
            tx = await heroNFTContract.mintBatchWithToken(
                connectedAddress,
                tokenIds,
                defaultToken
            );
        } else {
            const price = await heroNFTContract.getDefaultNativePrice();
            const totalPrice = price * BigInt(tokenIds.length);
            tx = await heroNFTContract.mintBatch(
                connectedAddress,
                tokenIds,
                { value: totalPrice }
            );
        }

        showMessage('Minting NFTs... Please wait for transaction confirmation');
        await tx.wait();
        showMessage('Batch NFT minting successful');
        await loadNFTList();
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
        const amount = getElement('priceConfigAmount').value;

        if (!validateNumber(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }
        if (!validateAddress(tokenAddress)) {
            showError('Please enter a valid token address');
            return;
        }
        if (!amount || Number.isNaN(Number(amount))) {
            showError('Please enter a valid price amount');
            return;
        }

        // Convert price to BigInt
        const priceBigInt = ethers.parseUnits(amount.toString(), 18);

        const tx = await heroNFTContract.setPriceConfig(tokenId, tokenAddress, priceBigInt);
        showMessage('Setting price config... Please wait for confirmation');
        await tx.wait();

        // Verify the price was set correctly
        const priceConfig = await heroNFTContract.getPriceConfig(tokenId);
        const setPriceFormatted = ethers.formatUnits(priceConfig.price, 18);

        if (setPriceFormatted !== amount) {
            throw new Error(`Price not set correctly. Expected: ${amount}, Got: ${setPriceFormatted}`);
        }

        showMessage('Price config set successfully');
    } catch (error) {
        showError('Failed to set price config:', error);
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

// Default Price Settings
async function setDefaultNativePrice() {
    try {
        const price = document.getElementById('defaultNativePrice').value;
        if (!price || Number.isNaN(Number(price))) {
            showError('Please enter a valid price amount');
            return;
        }

        const tx = await heroNFTContract.setDefaultNativePrice(
            ethers.parseEther(price)
        );
        showMessage('Setting default native price... Please wait for confirmation');
        await tx.wait();
        showMessage('Default native price set successfully');
    } catch (error) {
        showError(`Failed to set default native price: ${error.message}`);
    }
}

async function setDefaultTokenPrice() {
    try {
        const price = document.getElementById('defaultTokenPrice').value;
        if (!price || Number.isNaN(Number(price))) {
            showError('Please enter a valid price amount');
            return;
        }

        const tx = await heroNFTContract.setDefaultTokenPrice(
            ethers.parseUnits(price, 18)
        );
        showMessage('Setting default token price... Please wait for confirmation');
        await tx.wait();
        showMessage('Default token price set successfully');
    } catch (error) {
        showError(`Failed to set default token price: ${error.message}`);
    }
}

// Burn NFT
async function burnNFT(tokenId) {
    try {
        if (!tokenId || Number.isNaN(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }

        // Check if the user owns the token
        const owner = await heroNFTContract.ownerOf(tokenId);
        if (owner.toLowerCase() !== connectedAddress.toLowerCase()) {
            showError('You do not own this token');
            return;
        }

        const tx = await heroNFTContract.burn(tokenId);
        showMessage('Burning NFT... Please wait for confirmation');
        await tx.wait();
        showMessage('NFT burned successfully');

        // Refresh NFT list
        await loadNFTList();
    } catch (error) {
        showError(`Failed to burn NFT: ${error.message}`);
    }
}

// Initialize NFT contract
export async function initNFTContract(provider, signer, address) {
    try {
        if (!signer) {
            showError('Signer not available. Please connect wallet first.');
            return;
        }

        heroNFTContract = new ethers.Contract(nftContractAddress, heroNFTAbi, signer);
        connectedAddress = address;

        // Initialize contract info and settings
        await Promise.all([
            updateContractInfo(),
            getDefaultPaymentToken(),
            getDefaultNativePrice(),
            getDefaultTokenPrice(),
            loadNFTList()
        ]);

        showMessage('NFT contract initialized successfully');
    } catch (error) {
        console.error('Error initializing NFT contract:', error);
        showError(`Failed to initialize NFT contract: ${error.message}`);
    }
}

// Add NFT list loading function
async function loadNFTList() {
    try {
        const nftList = getElement('nftList');
        if (!nftList) return;

        if (!heroNFTContract) {
            showError('Contract not initialized. Please connect wallet first.');
            return;
        }

        // Get total supply and check each token
        const maxTokenId = 20; // Limit token ID range to 20 for testing
        const nftsContainer = document.createElement('div');
        nftsContainer.className = 'space-y-4';
        let foundNFTs = false;

        for (let tokenId = 1; tokenId <= maxTokenId; tokenId++) {
            try {
                const exists = await heroNFTContract.exists(tokenId);
                if (!exists) continue;

                const owner = await heroNFTContract.ownerOf(tokenId);
                if (owner.toLowerCase() === connectedAddress.toLowerCase()) {
                    foundNFTs = true;
                    const nftItem = document.createElement('div');
                    nftItem.className = 'bg-white p-4 rounded-lg shadow flex justify-between items-center';
                    nftItem.innerHTML = `
                        <div>
                            <span class="font-semibold">Token ID: ${tokenId.toString()}</span>
                        </div>
                        <div class="flex space-x-2">
                            <button onclick="burnNFT(${tokenId})" 
                                    class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                                Burn
                            </button>
                        </div>
                    `;
                    nftsContainer.appendChild(nftItem);
                }
            } catch (error) {
                console.error(`Error checking token ${tokenId}:`, error);
            }
        }

        nftList.innerHTML = '';
        if (!foundNFTs) {
            nftList.innerHTML = '<p class="text-gray-500">You don\'t own any NFTs from this contract</p>';
        } else {
            nftList.appendChild(nftsContainer);
        }
    } catch (error) {
        console.error('Error loading NFT list:', error);
        showError(`Failed to load NFT list: ${error.message}`);
    }
}

// Add connectWallet function to this file
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

        // Initialize contract with signer
        heroNFTContract = new ethers.Contract(nftContractAddress, heroNFTAbi, signer);

        // Update balances
        await updateBalances();

        // Enable buttons after successful connection
        const buttons = document.querySelectorAll('.requires-wallet');
        for (const button of buttons) {
            button.disabled = false;
        }

        return true;
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showError(`Failed to connect wallet: ${error.message}`);
        return false;
    }
}

// 添加新的函数来检查 NFT 价格
async function checkNFTPrice() {
    try {
        if (!window.ethereum) {
            showError('MetaMask is not installed');
            return;
        }

        // 确保合约已初始化
        if (!heroNFTContract) {
            // 尝试重新连接钱包
            const connected = await connectWallet();
            if (!connected || !heroNFTContract) {
                showError('Contract not initialized. Please connect wallet first.');
                return;
            }
        }

        const tokenId = Number(getElement('mintTokenId').value);
        if (!validateNumber(tokenId)) {
            showError('Please enter a valid token ID');
            return;
        }

        // 获取价格配置
        const config = await heroNFTContract.getPriceConfig(tokenId);
        const defaultNativePrice = await heroNFTContract.getDefaultNativePrice();
        const defaultTokenPrice = await heroNFTContract.getDefaultTokenPrice();

        // 显示价格
        const ethPriceElement = getElement('ethPrice');
        const tokenPriceElement = getElement('tokenPrice');

        if (config.isActive) {
            ethPriceElement.textContent = `${ethers.formatEther(config.price)} ETH (Custom)`;
            tokenPriceElement.textContent = `${ethers.formatUnits(config.price, 18)} Tokens (Custom)`;
        } else {
            ethPriceElement.textContent = `${ethers.formatEther(defaultNativePrice)} ETH (Default)`;
            tokenPriceElement.textContent = `${ethers.formatUnits(defaultTokenPrice, 18)} Tokens (Default)`;
        }

        // 获取并显示余额
        await updateBalances();

        showMessage('Price information updated successfully');
    } catch (error) {
        console.error('Error checking NFT price:', error);
        showError(`Failed to check NFT price: ${error.message}`);
    }
}

// 添加更新余额的函数
async function updateBalances() {
    try {
        if (!provider || !signer || !connectedAddress) {
            return;
        }

        // 获取 ETH 余额
        const ethBalance = await provider.getBalance(connectedAddress);
        getElement('ethBalance').textContent = `${ethers.formatEther(ethBalance)} ETH`;

        // 获取代币余额
        const defaultToken = await heroNFTContract.getDefaultPaymentToken();
        if (defaultToken !== ethers.ZeroAddress) {
            const tokenContract = new ethers.Contract(
                defaultToken,
                ['function balanceOf(address account) view returns (uint256)'],
                provider
            );
            const tokenBalance = await tokenContract.balanceOf(connectedAddress);
            getElement('tokenBalance').textContent = `${ethers.formatUnits(tokenBalance, 18)} Tokens`;
        } else {
            getElement('tokenBalance').textContent = 'N/A (Using ETH)';
        }
    } catch (error) {
        console.error('Error updating balances:', error);
        showError(`Failed to update balances: ${error.message}`);
    }
} 