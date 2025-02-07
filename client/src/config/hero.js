import heroAbi from '../js/abi/hero.js';
import heroMetadataAbi from '../js/abi/heroMetadata.js';
import baseConfig from './index.js';

// Hero 相关配置
export const heroConfig = {
    ethereum: {
        ...baseConfig.ethereum,
        contracts: {
            hero: '0x5aEe59c7D6434eC6f83066C388E6fe76959F9ec1',
            heroMetadata: '0xb6A58680db8ffA71B8eb219e11A8B1d267D01095',
            heroNFT: '0x5915c1D71bDfA5276A98FC9FE9074370721807c2'
        },
        abis: {
            hero: heroAbi,
            heroMetadata: heroMetadataAbi
        }
    },
    aptos: {
        ...baseConfig.aptos,
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