import { heroAbi } from '../js/abi/hero.js';
import { heroMetadataAbi } from '../js/abi/heroMetadata.js';
import baseConfig from './index.js';

// Hero 相关配置
export const heroConfig = {
    ethereum: {
        nodeUrl: 'https://sepolia.optimism.io',
        chainId: 11155420, // Optimism Sepolia testnet
        contracts: {
            hero: '0xb86236BA8D6CAb15cf7972871f246F7C8693338b',  // VITE_HERO_PROXY
            heroMetadata: '0x7603DdBcC4c998C7aB8DE7F91768c0ACd9CE2377',  // VITE_HERO_METADATA_PROXY
            heroNFT: '0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c',  // VITE_HERO_NFT_PROXY
            paymentToken: '0x0000000000000000000000000000000000000000',  // VITE_PAYMENT_TOKEN_ADDRESS
            erc20Token: '0xBda48255DA1ed61a209641144Dd24696926aF3F0'    // VITE_ERC20_CONTRACT_ADDRESS
        },
        prices: {
            nativePrice: '100000000000000000',    // VITE_NATIVE_PRICE
            tokenPrice: '100000000000000000000'   // VITE_ERC20_TOKEN_PRICE
        },
        abis: {
            hero: heroAbi,
            heroMetadata: heroMetadataAbi
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
        maxSkillId: 4
    }
}; 