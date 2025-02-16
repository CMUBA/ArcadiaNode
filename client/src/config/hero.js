import { heroAbi } from '../js/abi/hero.js';
import { heroMetadataAbi } from '../js/abi/heroMetadata.js';
import { heroNFTAbi } from '../js/abi/heroNFT.js';

// Hero 相关配置
export const heroConfig = {
    ethereum: {
        nodeUrl: 'https://sepolia.optimism.io',
        chainId: 11155420, // Optimism Sepolia testnet
        contracts: {
            hero: '0x5B34103d15C848b9a58e311f1bC6D913395AcB1C',      // HeroV5
            heroMetadata: '0xdB9E1B0Bb44cAA4b8B1073eAcfDd3FF1EA8d1C22', // HeroMetadata
            heroNFT: '0x776f3f1137bc5f7363EE2c25116546661d2B8131',    // HeroNFT
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