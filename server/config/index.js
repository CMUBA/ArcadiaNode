import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: process.env.PORT || 3008,
    ethereum: {
        rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://sepolia-rollup.arbitrum.io/rpc',
        contracts: {
            hero: process.env.HERO_CONTRACT_ADDRESS,
            heroNFT: process.env.HERO_NFT_CONTRACT_ADDRESS,
            heroMetadata: process.env.HERO_METADATA_CONTRACT_ADDRESS
        }
    },
    api: {
        basePath: '/api'
    }
};

export default config; 