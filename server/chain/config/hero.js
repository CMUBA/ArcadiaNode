import { heroAbi } from '../abi/hero.js';
import dotenv from 'dotenv';
import path from 'node:path'; // 确保导入 path 模块


// Load environment variables from .env file
dotenv.config();
// dotenv.config({ path: '../../../.env' }); // 直接使用相对路径
// console.log('Loaded environment variable for OPTIMISM_TESTNET_RPC_URL:', process.env.OPTIMISM_TESTNET_RPC_URL);
// Hero related configuration
export const heroConfig = {
    ethereum: {
        // Use hardcoded RPC URL as fallback if environment variable is not set
        nodeUrl: process.env.OPTIMISM_TESTNET_RPC_URL || 'https://opt-sepolia.g.alchemy.com/v2/IIY_LZOlEuy66agzhxpYexmEaHuMskl-',
        chainId: 11155420, // Optimism Sepolia testnet
        contracts: {
            hero: '0x9a838413a9Cf204535CF61df4479aACa92eA9E81',      // HeroV6
            heroMetadata: '0x3a57C9dd80d59Bee309288a8ADA28d494FcC51fB', // HeroMetadata
            heroNFT: '0x00b203a541e4CD2C4373082bF2268A78E15CbD4B', 
            paymentToken: '0x0000000000000000000000000000000000000000',  // ETH
            erc20Token: '0xBda48255DA1ed61a209641144Dd24696926aF3F0'     // ERC20 Token for payments
        },
        abis: {
            hero: heroAbi
        }
    }
};

export default heroConfig; 
