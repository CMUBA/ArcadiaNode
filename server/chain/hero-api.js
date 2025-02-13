import express from 'express';
import { ethers } from 'ethers';
import { heroAbi } from '../../client/src/js/abi/hero.js';
import { heroConfig } from '../../client/src/config/hero.js';

const router = express.Router();
const { hero: heroContractAddress } = heroConfig.ethereum.contracts;

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
        if (!nftContract || !tokenId || !name || !race || !gender) {
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

        // Create hero
        const tx = await heroContract.createHero(nftContract, tokenId, name, race, gender);
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

// Load Hero API
router.get('/:nftContract/:tokenId', verifySignature, async (req, res) => {
    try {
        const { nftContract, tokenId } = req.params;

        // Initialize provider and contract
        const provider = new ethers.JsonRpcProvider('https://sepolia.optimism.io');
        const heroContract = new ethers.Contract(heroContractAddress, heroAbi, provider);

        // Get hero info
        const heroInfo = await heroContract.getHeroInfo(nftContract, tokenId);

        // Convert BigInt values to strings
        const response = {
            name: heroInfo.name,
            race: heroInfo.race.toString(),
            gender: heroInfo.gender.toString(),
            level: heroInfo.level.toString(),
            experience: heroInfo.experience.toString(),
            energy: heroInfo.energy.toString(),
            lastEnergyUpdateTime: heroInfo.lastEnergyUpdateTime.toString(),
            dailyPoints: heroInfo.dailyPoints.toString(),
            lastDailyPointsUpdateTime: heroInfo.lastDailyPointsUpdateTime.toString()
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
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