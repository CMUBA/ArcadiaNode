import { ethers } from 'ethers';
import { IChainAdapter } from './IChainAdapter';
import { ChainConfig } from '../../config/chains';
import { logger } from '../../utils/logger';

export class EVMChainAdapter implements IChainAdapter {
  private provider: ethers.JsonRpcProvider;
  private chainConfig: ChainConfig;

  constructor(chainConfig: ChainConfig) {
    this.chainConfig = chainConfig;
    this.provider = new ethers.JsonRpcProvider(
      chainConfig.rpcUrls[0].replace('${ALCHEMY_API_KEY}', process.env.ALCHEMY_API_KEY || '')
    );
  }

  async connect(): Promise<boolean> {
    try {
      const network = await this.provider.getNetwork();
      logger.info(`Connected to EVM chain: ${network.name}`);
      return true;
    } catch (error) {
      logger.error('Failed to connect to EVM chain:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    // Clean up any resources if needed
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return balance.toString();
  }

  async callContract(
    address: string,
    method: string,
    params: any[]
  ): Promise<any> {
    try {
      const contract = new ethers.Contract(
        address,
        [], // ABI will be injected based on the contract type
        this.provider
      );
      return await contract[method](...params);
    } catch (error) {
      logger.error('Contract call failed:', error);
      throw error;
    }
  }

  async sendTransaction(tx: any): Promise<string> {
    try {
      const transaction = await this.provider.sendTransaction(tx);
      const receipt = await transaction.wait();
      return receipt.hash;
    } catch (error) {
      logger.error('Transaction failed:', error);
      throw error;
    }
  }

  async queryHeroData(address: string): Promise<any> {
    // Implement hero data query from EVM contract
    const heroContract = new ethers.Contract(
      process.env.HERO_CONTRACT_ADDRESS || '',
      [], // Hero contract ABI
      this.provider
    );
    return await heroContract.getHeroData(address);
  }

  async queryNFTData(tokenId: string): Promise<any> {
    // Implement NFT data query from EVM contract
    const nftContract = new ethers.Contract(
      process.env.NFT_CONTRACT_ADDRESS || '',
      [], // NFT contract ABI
      this.provider
    );
    return await nftContract.tokenURI(tokenId);
  }
} 