import { heroAbi } from '../js/abi/hero.js';
import { heroMetadataAbi } from '../js/abi/heroMetadata.js';
import { heroNFTAbi } from '../js/abi/heroNFT.js';

// Hero 相关配置
export const heroConfig = {
    ethereum: {
        nodeUrl: 'https://sepolia.optimism.io',
        chainId: 11155420, // Optimism Sepolia testnet
        contracts: {
            hero: '0x4699c7C04332a49601459aB65Eb52f0549397ea8',      // HeroV6
            heroMetadata: '0xa56b92ffBFbC2e4a9c51a151CA2b283953e764b5', // HeroMetadata
            heroNFT: '0x145FAc26022318bC30808054b87f03327A9afCc9',    // HeroNFT
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
        maxSkillId: 4
    },
    contractAddresses: {
        MOVE_HERO_NFT_ADDRESS: '0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8',
        MOVE_HERO_ADDRESS: '0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8',
        MOVE_HERO_METADATA_ADDRESS: '0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8'
    }
}; 
export default heroConfig;