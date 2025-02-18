// 添加环境变量调试日志
console.log('All env variables:', import.meta.env);

// 获取合约地址（从 Vite 的 define 配置中获取）
const contractAddresses = window.__CONTRACT_ADDRESSES__ || {
    TOKEN_CONTRACT_ADDRESS: '0xBda48255DA1ed61a209641144Dd24696926aF3F0',
    STAKE_MANAGER_ADDRESS: '0xf7081161f19FB6246c1931aABd4fbe890DbdE8c4',
    NODE_REGISTRY_ADDRESS: '0xE1A3B41be95Ff379DBDFd194680d26b5d8786462',
    MOVE_HERO_NFT_ADDRESS: '0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8',
    MOVE_HERO_ADDRESS: '0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8',
    MOVE_HERO_METADATA_ADDRESS: '0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8',
    VITE_HERO_CONTRACT_ADDRESS: '0x5B34103d15C848b9a58e311f1bC6D913395AcB1C',
    VITE_HERO_METADATA_CONTRACT_ADDRESS: '0xdB9E1B0Bb44cAA4b8B1073eAcfDd3FF1EA8d1C22',
    VITE_HERO_NFT_CONTRACT_ADDRESS: '0x776f3f1137bc5f7363EE2c25116546661d2B8131'

};

console.log('Contract addresses from define:', contractAddresses);

// 基础配置
const config = {
    // API URLs
    SERVER_API_URL: import.meta.env.VITE_SERVER_API_URL || 'http://localhost:3017/api/v1',
    SERVERX_API_URL: import.meta.env.VITE_SERVERX_API_URL || 'http://localhost:3018/api/v1',
    TOKEN_CONTRACT_ADDRESS: contractAddresses.TOKEN_CONTRACT_ADDRESS,
    STAKE_MANAGER_ADDRESS: contractAddresses.STAKE_MANAGER_ADDRESS,
    NODE_REGISTRY_ADDRESS: contractAddresses.NODE_REGISTRY_ADDRESS,            
    MOVE_HERO_NFT_ADDRESS: contractAddresses.MOVE_HERO_NFT_ADDRESS,
    MOVE_HERO_ADDRESS: contractAddresses.MOVE_HERO_ADDRESS,
    MOVE_HERO_METADATA_ADDRESS: contractAddresses.MOVE_HERO_METADATA_ADDRESS,
    VITE_HERO_CONTRACT_ADDRESS: contractAddresses.VITE_HERO_CONTRACT_ADDRESS,
    VITE_HERO_METADATA_CONTRACT_ADDRESS: contractAddresses.VITE_HERO_METADATA_CONTRACT_ADDRESS,
    VITE_HERO_NFT_CONTRACT_ADDRESS: contractAddresses.VITE_HERO_NFT_CONTRACT_ADDRESS,

    
    // 其他配置
    CLIENT_PORT: import.meta.env.VITE_CLIENT_PORT || 3008,
    SERVER_PORT: import.meta.env.VITE_SERVER_PORT || 3017,
    SERVERX_PORT: import.meta.env.VITE_SERVERX_PORT || 3018,
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3017',
    API_PREFIX: import.meta.env.VITE_API_PREFIX || '/api/v1',

    // 区块链配置
    ethereum: {
        rpcUrl: import.meta.env.VITE_OPTIMISM_TESTNET_RPC_URL,
        contracts: {
            hero: import.meta.env.VITE_HERO_CONTRACT_ADDRESS,
            heroNFT: import.meta.env.VITE_HERO_NFT_CONTRACT_ADDRESS,
            heroMetadata: import.meta.env.VITE_HERO_METADATA_CONTRACT_ADDRESS        }
    }
};

export default config;

console.log('Config:', config);