import { heroAbi } from '../js/abi/hero-v6.js';
import { heroMetadataAbi } from '../js/abi/heroMetadata.js';
import { heroNFTAbi } from '../js/abi/heroNFT.js';

// Hero 相关配置
export const heroConfig = {
    ethereum: {
        nodeUrl: 'https://sepolia.optimism.io',
        chainId: 11155420, // Optimism Sepolia testnet
        contracts: {
            hero: '0x9a838413a9Cf204535CF61df4479aACa92eA9E81',      // HeroV6
            heroMetadata: '0x3a57C9dd80d59Bee309288a8ADA28d494FcC51fB', // HeroMetadata
            heroNFT: '0x00b203a541e4CD2C4373082bF2268A78E15CbD4B', 
            paymentToken: '0x0000000000000000000000000000000000000000',  // ETH
            erc20Token: '0xBda48255DA1ed61a209641144Dd24696926aF3F0'     // ERC20 Token for payments
        },
        prices: {
            nativePrice: '10000000000000000',    // 0.01 ETH
            tokenPrice: '100000000000000000000'  // 100 tokens
        },
        abis: {
            hero: heroAbi,
            heroMetadata: heroMetadataAbi,
            heroNFT: heroNFTAbi
        }
    },
    aptos: {
        nodeUrl: 'https://fullnode.testnet.aptoslabs.com',
        contracts: {
            heroNft: '0x...',
            hero: '0x...'
        }
    },
    test: {
        defaultGas: 300000,
        defaultGasPrice: '1000000000',
        races: ['Human', 'Elf', 'Dwarf', 'Orc', 'Undead'],
        classes: ['Warrior', 'Mage', 'Archer', 'Rogue', 'Priest'],
        seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
        maxSkillLevel: 10,
        maxSkillId: 4,
        SERVER_API_URL: 'http://localhost:3017/api/v1'
    },
    contractAddresses: {
        MOVE_HERO_NFT_ADDRESS: '0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8',
        MOVE_HERO_ADDRESS: '0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8',
        MOVE_HERO_METADATA_ADDRESS: '0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8'
    }
}; 
export default heroConfig;