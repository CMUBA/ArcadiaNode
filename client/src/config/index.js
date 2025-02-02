// 添加环境变量调试日志
console.log('All env variables:', import.meta.env);

// 获取合约地址（从 Vite 的 define 配置中获取）
const contractAddresses = window.__CONTRACT_ADDRESSES__ || {
    TOKEN_CONTRACT_ADDRESS: '0xBda48255DA1ed61a209641144Dd24696926aF3F0',
    STAKE_MANAGER_ADDRESS: '0xf7081161f19FB6246c1931aABd4fbe890DbdE8c4',
    NODE_REGISTRY_ADDRESS: '0x7E623E5C2598C04209F217ce0ee92B88bE7F03c4'
};

console.log('Contract addresses from define:', contractAddresses);

// 基础配置
const config = {
    // API URLs
    SERVER_API_URL: import.meta.env.VITE_SERVER_API_URL || 'http://localhost:3017/api/v1',
    SERVERX_API_URL: import.meta.env.VITE_SERVERX_API_URL || 'http://localhost:3018/api/v1',
    
    // 其他配置
    CLIENT_PORT: import.meta.env.VITE_CLIENT_PORT || 3008,
    SERVER_PORT: import.meta.env.VITE_SERVER_PORT || 3017,
    SERVERX_PORT: import.meta.env.VITE_SERVERX_PORT || 3018,
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3017',

    // 区块链配置
    OPTIMISM_TESTNET_RPC_URL: import.meta.env.VITE_OPTIMISM_TESTNET_RPC_URL || 'https://opt-sepolia.g.alchemy.com/v2/GyzNf_EiQiun2BgYRnXLmgWFZNpLVF1J',
    TOKEN_CONTRACT_ADDRESS: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS || '0xBda48255DA1ed61a209641144Dd24696926aF3F0',
    STAKE_MANAGER_ADDRESS: import.meta.env.VITE_STAKE_MANAGER_ADDRESS || '0xf7081161f19FB6246c1931aABd4fbe890DbdE8c4',
    NODE_REGISTRY_ADDRESS: import.meta.env.VITE_NODE_REGISTRY_ADDRESS || '0x7E623E5C2598C04209F217ce0ee92B88bE7F03c4',
    NODE_PRIVATE_KEY: import.meta.env.VITE_NODE_PRIVATE_KEY
};

// 添加调试日志
console.log('Environment variables:', {
    TOKEN_CONTRACT_ADDRESS: import.meta.env.VITE_TOKEN_CONTRACT_ADDRESS,
    STAKE_MANAGER_ADDRESS: import.meta.env.VITE_STAKE_MANAGER_ADDRESS,
    NODE_REGISTRY_ADDRESS: import.meta.env.VITE_NODE_REGISTRY_ADDRESS
});

console.log('Config object with defaults:', {
    TOKEN_CONTRACT_ADDRESS: config.TOKEN_CONTRACT_ADDRESS,
    STAKE_MANAGER_ADDRESS: config.STAKE_MANAGER_ADDRESS,
    NODE_REGISTRY_ADDRESS: config.NODE_REGISTRY_ADDRESS
});

// 验证配置项（使用了默认值，所以不应该出现 undefined）
if (!config.TOKEN_CONTRACT_ADDRESS) {
    console.warn('Using default TOKEN_CONTRACT_ADDRESS');
}
if (!config.STAKE_MANAGER_ADDRESS) {
    console.warn('Using default STAKE_MANAGER_ADDRESS');
}
if (!config.NODE_REGISTRY_ADDRESS) {
    console.warn('Using default NODE_REGISTRY_ADDRESS');
}

export default config; 