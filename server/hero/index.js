import express from 'express';
import { ethers } from 'ethers';
const router = express.Router();

// Verify signature middleware
const verifySignature = (req, res, next) => {
    try {
        const signature = req.headers.signature;
        const message = req.headers.message;
        const address = req.headers.address;

        if (!signature || !message || !address) {
            return res.status(400).json({
                error: 'Missing signature, message, or address in headers'
            });
        }

        // Verify the signature
        const recoveredAddress = ethers.verifyMessage(message, signature);
        
        if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
            return res.status(401).json({
                error: 'Invalid signature'
            });
        }

        next();
    } catch (error) {
        console.error('Signature verification error:', error);
        res.status(401).json({
            error: 'Signature verification failed'
        });
    }
};

// Create Hero API
router.post('/create', verifySignature, async (req, res) => {
    try {
        const {
            nftContract,
            tokenId,
            name,
            race,
            gender,
            transactionHash
        } = req.body;

        // Validate required parameters
        if (!nftContract || !tokenId || !name || race === undefined || !transactionHash) {
            return res.status(400).json({
                error: 'Missing required parameters',
                received: {
                    nftContract,
                    tokenId,
                    name,
                    race,
                    gender,
                    transactionHash
                }
            });
        }

        // Get environment variables
        const rpcUrl = process.env.OPTIMISM_TESTNET_RPC_URL;
        const heroContractAddress = process.env.HERO_CONTRACT_ADDRESS;

        if (!rpcUrl || !heroContractAddress) {
            throw new Error('Missing required environment variables');
        }

        // Initialize provider
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        // 等待交易确认
        const receipt = await provider.getTransactionReceipt(transactionHash);
        if (!receipt) {
            return res.status(400).json({
                error: 'Transaction not confirmed yet'
            });
        }

        res.json({
            success: true,
            message: 'Hero created successfully',
            data: {
                txHash: transactionHash,
                nftContract,
                tokenId,
                name,
                race,
                gender
            }
        });
    } catch (error) {
        console.error('Create hero error:', error);
        res.status(500).json({
            error: 'Failed to create hero',
            details: error.message
        });
    }
});

// Load Hero API
router.get('/:nftContract/:tokenId', verifySignature, async (req, res) => {
    try {
        const { nftContract, tokenId } = req.params;

        // Validate parameters
        if (!nftContract || !tokenId) {
            return res.status(400).json({
                error: 'Missing required parameters'
            });
        }

        // Get environment variables
        const rpcUrl = process.env.OPTIMISM_TESTNET_RPC_URL;
        const heroContractAddress = process.env.HERO_CONTRACT_ADDRESS;

        if (!rpcUrl || !heroContractAddress) {
            throw new Error('Missing required environment variables');
        }

        // Initialize provider and contract
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const abi = [
            "function getHeroInfo(address nftContract, uint256 tokenId) external view returns (string name, uint8 race, uint8 gender, uint256 level, uint256 energy, uint256 dailyPoints)"
        ];
        
        const contract = new ethers.Contract(heroContractAddress, abi, provider);

        // Get hero info
        const heroInfo = await contract.getHeroInfo(nftContract, tokenId);

        res.json({
            success: true,
            data: {
                name: heroInfo[0],
                race: Number(heroInfo[1]),
                gender: Number(heroInfo[2]),
                level: Number(heroInfo[3]),
                energy: Number(heroInfo[4]),
                dailyPoints: Number(heroInfo[5])
            }
        });
    } catch (error) {
        console.error('Load hero error:', error);
        res.status(500).json({
            error: 'Failed to load hero',
            details: error.message
        });
    }
});

// Save Hero API
router.put('/save', verifySignature, async (req, res) => {
    try {
        const {
            nftContract,
            tokenId,
            heroData,
            signedTx
        } = req.body;

        // Validate required parameters
        if (!nftContract || !tokenId || !heroData || !signedTx) {
            return res.status(400).json({
                error: 'Missing required parameters'
            });
        }

        // Get environment variables
        const rpcUrl = process.env.OPTIMISM_TESTNET_RPC_URL;
        const heroContractAddress = process.env.HERO_CONTRACT_ADDRESS;

        if (!rpcUrl || !heroContractAddress) {
            throw new Error('Missing required environment variables');
        }

        // Initialize provider
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        // Send the signed transaction
        const tx = await provider.broadcastTransaction(signedTx);
        console.log('Save hero transaction sent:', tx.hash);
        
        const receipt = await tx.wait();
        console.log('Save hero transaction confirmed:', receipt);

        res.json({
            success: true,
            message: 'Hero saved successfully',
            data: {
                txHash: receipt.hash,
                nftContract,
                tokenId,
                heroData
            }
        });
    } catch (error) {
        console.error('Save hero error:', error);
        res.status(500).json({
            error: 'Failed to save hero',
            details: error.message
        });
    }
});

export { router as heroRouter }; 