import express from 'express';
import { ethers } from 'ethers';
import { heroAbi } from './abi/hero-v6.js';
import { heroConfig } from './config/hero.js';

const router = express.Router();
const { hero: heroContractAddress } = heroConfig.ethereum.contracts;
const nodeUrl = heroConfig.ethereum.nodeUrl;

// Check if required configuration is available
if (!nodeUrl) {
    console.error('Missing RPC URL configuration. Using default Optimism Sepolia RPC URL.');
}

if (!heroContractAddress) {
    console.error('Missing hero contract address configuration.');
}

// Middleware to verify wallet signature
const verifySignature = async (req, res, next) => {
    try {
        const { signature, message, address } = req.headers;
        if (!signature || !message || !address) {
            return res.status(401).json({ error: 'Missing authentication headers' });
        }

        const recoveredAddress = ethers.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return res.status(401).json({ error: 'Invalid signature' });
        }

        req.userAddress = address;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid signature' });
    }
};

// Create Hero API
router.post('/create', verifySignature, async (req, res) => {
    try {
        const { nftContract, tokenId, name, race, gender } = req.body;

        // Validate input
        if (!nftContract || !tokenId || !name || race === undefined || gender === undefined) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // 详细检查所有可能缺失的环境变量
        console.log('Environment variables check:');
        console.log('- OPTIMISM_TESTNET_RPC_URL:', process.env.OPTIMISM_TESTNET_RPC_URL ? 'Set' : 'Not set');
        console.log('- PRIVATE_KEY:', process.env.PRIVATE_KEY ? 'Set' : 'Not set');
        console.log('- nodeUrl:', nodeUrl ? 'Set' : 'Not set');
        console.log('- heroContractAddress:', heroContractAddress ? 'Set' : 'Not set');

        // 检查私钥是否缺失
        if (!process.env.PRIVATE_KEY) {
            return res.status(500).json({ 
                error: 'Failed to create hero',
                details: 'Missing PRIVATE_KEY environment variable'
            });
        }

        // Check if required configuration is available
        if (!nodeUrl) {
            return res.status(500).json({ 
                error: 'Failed to create hero',
                details: 'Missing RPC URL configuration'
            });
        }

        if (!heroContractAddress) {
            return res.status(500).json({ 
                error: 'Failed to create hero',
                details: 'Missing hero contract address configuration'
            });
        }

        // Initialize provider and contract
        console.log('Initializing provider with URL:', nodeUrl);
        const provider = new ethers.JsonRpcProvider(nodeUrl);
        
        try {
            // 尝试使用默认私钥
            const defaultPrivateKey = '0x0000000000000000000000000000000000000000000000000000000000000001';
            const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || defaultPrivateKey, provider);
            console.log('Wallet address:', wallet.address);
            
            const heroContract = new ethers.Contract(heroContractAddress, heroAbi, wallet);
            console.log('Hero contract initialized with address:', heroContractAddress);

            // Verify ownership
            const nftContractInstance = new ethers.Contract(
                nftContract,
                ['function ownerOf(uint256) view returns (address)'],
                provider
            );
            
            const nftOwner = await nftContractInstance.ownerOf(tokenId);
            console.log('NFT owner:', nftOwner);
            console.log('Request user address:', req.userAddress);
            
            if (nftOwner.toLowerCase() !== req.userAddress.toLowerCase()) {
                return res.status(403).json({ error: 'Not the NFT owner' });
            }

            // Create hero
            console.log('Creating hero with params:', { nftContract, tokenId, name, race, gender });
            const tx = await heroContract.createHero(nftContract, tokenId, name, race, gender);
            console.log('Transaction sent:', tx.hash);
            
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt.hash);

            res.json({
                success: true,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber
            });
        } catch (error) {
            console.error('Create hero error details:', error);
            
            // 检查是否是私钥相关错误
            if (error.message && (
                error.message.includes('private key') || 
                error.message.includes('private-key') ||
                error.message.includes('privateKey') ||
                error.message.includes('signing key')
            )) {
                return res.status(500).json({ 
                    error: 'Failed to create hero',
                    details: 'Invalid or missing private key'
                });
            }
            
            return res.status(500).json({ 
                error: 'Failed to create hero',
                details: error.message
            });
        }
    } catch (error) {
        console.error('Create hero API error:', error);
        res.status(500).json({ 
            error: 'Failed to create hero',
            details: error.message
        });
    }
});

// Load Hero API
router.get('/:nftContract/:tokenId', async (req, res) => {
    try {
        const { nftContract, tokenId } = req.params;
        console.log('Loading hero with params:', { nftContract, tokenId });

        // 验证输入
        if (!nftContract || !ethers.isAddress(nftContract)) {
            return res.status(400).json({ 
                error: 'Invalid NFT contract address',
                success: false
            });
        }
        
        if (!tokenId || Number.isNaN(Number(tokenId))) {
            return res.status(400).json({ 
                error: 'Invalid token ID',
                success: false
            });
        }

        // 检查必要的配置
        if (!nodeUrl) {
            console.error('Missing RPC URL configuration');
            return res.status(500).json({ 
                error: 'Failed to load hero',
                details: 'Missing RPC URL configuration',
                success: false
            });
        }

        if (!heroContractAddress) {
            console.error('Missing hero contract address configuration');
            return res.status(500).json({ 
                error: 'Failed to load hero',
                details: 'Missing hero contract address configuration',
                success: false
            });
        }

        console.log('Initializing provider with URL:', nodeUrl);
        console.log('Hero contract address:', heroContractAddress);

        // Initialize provider and contract
        const provider = new ethers.JsonRpcProvider(nodeUrl);
        const heroContract = new ethers.Contract(heroContractAddress, heroAbi, provider);

        try {
            // Get hero info
            console.log('Calling getHeroInfo...');
            const heroInfo = await heroContract.getHeroInfo(nftContract, tokenId);
            console.log('Hero info retrieved:', heroInfo);
            
            // 格式化响应
            let response;
            
            // 如果返回的是一个结构体（tuple）
            if (heroInfo && typeof heroInfo === 'object' && !Array.isArray(heroInfo)) {
                response = {
                    success: true,
                    name: heroInfo.name,
                    race: heroInfo.race.toString(),
                    gender: heroInfo.gender.toString(),
                    level: heroInfo.level.toString(),
                    energy: heroInfo.energy.toString(),
                    dailyPoints: heroInfo.dailyPoints.toString()
                };
            } 
            // 如果返回的是一个数组
            else if (Array.isArray(heroInfo)) {
                response = {
                    success: true,
                    name: heroInfo[0],
                    race: heroInfo[1].toString(),
                    gender: heroInfo[2].toString(),
                    level: heroInfo[3].toString(),
                    energy: heroInfo[4].toString(),
                    dailyPoints: heroInfo[5].toString()
                };
            }
            
            console.log('Sending response:', response);
            res.json(response);
        } catch (error) {
            console.error('Get hero info error:', error);
            
            // 检查是否是"英雄不存在"错误
            if (error?.message?.includes('Hero does not exist')) {
                return res.status(404).json({ 
                    error: 'Hero does not exist',
                    details: 'This hero has not been created yet',
                    success: false
                });
            }
            
            return res.status(500).json({ 
                error: 'Failed to get hero info',
                details: error.message,
                success: false
            });
        }
    } catch (error) {
        console.error('Load hero API error:', error);
        res.status(500).json({ 
            error: 'Failed to load hero',
            details: error.message,
            success: false
        });
    }
});

// Save Hero API
router.put('/save', verifySignature, async (req, res) => {
    try {
        const { nftContract, tokenId, heroData } = req.body;

        // Validate input
        if (!nftContract || !tokenId || !heroData) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Initialize provider and contract
        const provider = new ethers.JsonRpcProvider('https://sepolia.optimism.io');
        const heroContract = new ethers.Contract(heroContractAddress, heroAbi, provider);

        // Verify ownership
        const nftOwner = await heroContract.ownerOf(nftContract, tokenId);
        if (nftOwner.toLowerCase() !== req.userAddress.toLowerCase()) {
            return res.status(403).json({ error: 'Not the NFT owner' });
        }

        // Update hero data
        const tx = await heroContract.updateHero(nftContract, tokenId, heroData);
        const receipt = await tx.wait();

        res.json({
            success: true,
            transactionHash: receipt.hash,
            blockNumber: receipt.blockNumber
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router; 