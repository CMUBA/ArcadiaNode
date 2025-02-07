const config = {
    debug: true, // 开启调试模式
    
    // 以太坊配置
    ethereum: {
        nodeUrl: 'https://sepolia.optimism.io',
        chainId: 11155420, // Optimism Sepolia testnet
        contracts: {
            hero: '0x5aEe59c7D6434eC6f83066C388E6fe76959F9ec1',  // Hero Proxy
            heroMetadata: '0xb6A58680db8ffA71B8eb219e11A8B1d267D01095',  // Hero Metadata Proxy
            heroNFT: '0x5915c1D71bDfA5276A98FC9FE9074370721807c2'  // Hero NFT Proxy
        }
    },
    
    // Aptos 配置
    aptos: {
        nodeUrl: 'https://fullnode.testnet.aptoslabs.com',
        contracts: {
            heroNft: '0x...',
            hero: '0x...'
        }
    },
    
    // 调试函数
    log: function(message, data = null) {
        if (this.debug) {
            console.log(`[DEBUG] ${message}`, data || '');
        }
    },
    
    // 合约加载检查
    checkContractLoading: function() {
        if (this.debug) {
            console.group('Contract Loading Check');
            
            // 检查以太坊合约
            console.log('Ethereum Contracts:');
            console.log('- HeroNFT:', this.ethereum.contracts.heroNFT);
            console.log('- Hero:', this.ethereum.contracts.hero);
            console.log('- HeroMetadata:', this.ethereum.contracts.heroMetadata);
            
            // 检查 Aptos 合约
            console.log('Aptos Contracts:');
            console.log('- HeroNFT:', this.aptos.contracts.heroNft);
            console.log('- Hero:', this.aptos.contracts.hero);
            
            console.groupEnd();
        }
    },
    
    // 环境变量检查
    checkEnvironment: function() {
        if (this.debug) {
            console.group('Environment Check');
            
            // 检查必要的环境变量
            const requiredEnvVars = [
                'HERO_NFT_ADDRESS',
                'HERO_ADDRESS',
                'HERO_METADATA_ADDRESS',
                'ETH_NODE_URL',
                'APTOS_NODE_URL',
                'APTOS_HERO_NFT_ADDRESS',
                'APTOS_HERO_ADDRESS'
            ];
            
            for (const varName of requiredEnvVars) {
                console.log(`${varName}: ${window.ENV?.[varName] ? '✓' : '✗'}`);
            }
            
            console.groupEnd();
        }
    }
};

if (typeof window !== 'undefined') {
    window.config = config;
} 