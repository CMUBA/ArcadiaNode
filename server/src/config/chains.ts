export interface ChainConfig {
  id: number;
  name: string;
  network: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  testnet: boolean;
}

export const SUPPORTED_CHAINS: { [key: number]: ChainConfig } = {
  // Ethereum Mainnet
  1: {
    id: 1,
    name: 'Ethereum',
    network: 'mainnet',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}'],
    blockExplorerUrls: ['https://etherscan.io'],
    testnet: false,
  },
  // Goerli Testnet
  5: {
    id: 5,
    name: 'Goerli',
    network: 'goerli',
    nativeCurrency: {
      name: 'Goerli Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://eth-goerli.g.alchemy.com/v2/${ALCHEMY_API_KEY}'],
    blockExplorerUrls: ['https://goerli.etherscan.io'],
    testnet: true,
  },
  // Polygon Mainnet
  137: {
    id: 137,
    name: 'Polygon',
    network: 'polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}'],
    blockExplorerUrls: ['https://polygonscan.com'],
    testnet: false,
  },
  // Polygon Mumbai Testnet
  80001: {
    id: 80001,
    name: 'Mumbai',
    network: 'mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-mumbai.g.alchemy.com/v2/${ALCHEMY_API_KEY}'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
    testnet: true,
  },
  // Arbitrum One
  42161: {
    id: 42161,
    name: 'Arbitrum One',
    network: 'arbitrum',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://arb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}'],
    blockExplorerUrls: ['https://arbiscan.io'],
    testnet: false,
  },
  // Optimism
  10: {
    id: 10,
    name: 'Optimism',
    network: 'optimism',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['https://opt-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}'],
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
    testnet: false,
  },
  // Aptos Mainnet
  1000: {
    id: 1000,
    name: 'Aptos',
    network: 'mainnet',
    nativeCurrency: {
      name: 'Aptos',
      symbol: 'APT',
      decimals: 8,
    },
    rpcUrls: ['https://fullnode.mainnet.aptoslabs.com/v1'],
    blockExplorerUrls: ['https://explorer.aptoslabs.com'],
    testnet: false,
  },
  // Aptos Testnet
  1001: {
    id: 1001,
    name: 'Aptos Testnet',
    network: 'testnet',
    nativeCurrency: {
      name: 'Aptos',
      symbol: 'APT',
      decimals: 8,
    },
    rpcUrls: ['https://fullnode.testnet.aptoslabs.com/v1'],
    blockExplorerUrls: ['https://explorer.aptoslabs.com/?network=testnet'],
    testnet: true,
  },
};

export const isEVMChain = (chainId: number): boolean => {
  return chainId !== 1000 && chainId !== 1001;
};

export const isAptosChain = (chainId: number): boolean => {
  return chainId === 1000 || chainId === 1001;
};

export const getChainConfig = (chainId: number): ChainConfig => {
  const config = SUPPORTED_CHAINS[chainId];
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }
  return config;
}; 