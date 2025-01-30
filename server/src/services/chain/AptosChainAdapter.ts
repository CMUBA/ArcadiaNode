import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
import WebSocket from 'ws';
import { IChainAdapter } from './IChainAdapter';
import { ChainConfig } from '../../config/chains';
import { logger } from '../../utils/logger';

interface NoditWebhookEvent {
  type: string;
  data: {
    transaction_hash: string;
    sender: string;
    timestamp: string;
    [key: string]: any;
  };
}

export class AptosChainAdapter implements IChainAdapter {
  private client: Aptos;
  private chainConfig: ChainConfig;
  private ws: WebSocket | null = null;
  private webhookHandlers: Map<string, (event: NoditWebhookEvent) => void>;

  constructor(chainConfig: ChainConfig) {
    this.chainConfig = chainConfig;
    const network = chainConfig.network === 'mainnet' ? Network.MAINNET : Network.TESTNET;
    
    const config = new AptosConfig({ 
      network,
      clientConfig: {
        API_KEY: process.env.NODIT_API_KEY || ''
      }
    });
    
    this.client = new Aptos(config);
    this.webhookHandlers = new Map();
    this.setupWebSocket();
  }

  private setupWebSocket() {
    const wsUrl = `wss://api.nodit.io/v1/chains/aptos/${this.chainConfig.network}/ws`;
    this.ws = new WebSocket(wsUrl, {
      headers: {
        'x-api-key': process.env.NODIT_API_KEY || ''
      }
    });

    this.ws.on('open', () => {
      logger.info('Connected to Nodit WebSocket');
      // Subscribe to specific events
      this.subscribeToEvents();
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const event = JSON.parse(data.toString()) as NoditWebhookEvent;
        this.handleWebhookEvent(event);
      } catch (error) {
        logger.error('Failed to parse WebSocket message:', error);
      }
    });

    this.ws.on('error', (error) => {
      logger.error('WebSocket error:', error);
    });

    this.ws.on('close', () => {
      logger.info('WebSocket connection closed, attempting to reconnect...');
      setTimeout(() => this.setupWebSocket(), 5000);
    });
  }

  private subscribeToEvents() {
    if (!this.ws) return;
    
    // Subscribe to contract events
    const subscribeMsg = {
      type: 'subscribe',
      data: {
        address: process.env.APTOS_HERO_CONTRACT_ADDRESS,
        events: ['hero_created', 'hero_updated']
      }
    };
    
    this.ws.send(JSON.stringify(subscribeMsg));
  }

  private handleWebhookEvent(event: NoditWebhookEvent) {
    const handler = this.webhookHandlers.get(event.type);
    if (handler) {
      handler(event);
    }
  }

  public addWebhookHandler(eventType: string, handler: (event: NoditWebhookEvent) => void) {
    this.webhookHandlers.set(eventType, handler);
  }

  async connect(): Promise<boolean> {
    try {
      await this.client.getLedgerInfo();
      logger.info(`Connected to Aptos ${this.chainConfig.network}`);
      return true;
    } catch (error) {
      logger.error('Failed to connect to Aptos:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      const accountResource = await this.client.getAccountResource(
        address,
        '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );
      return accountResource.data.coin.value.toString();
    } catch (error) {
      logger.error('Failed to get balance:', error);
      throw error;
    }
  }

  async callContract(
    address: string,
    method: string,
    params: unknown[]
  ): Promise<unknown> {
    try {
      const transaction = await this.client.view({
        function: `${address}::${method}`,
        type_arguments: [],
        arguments: params
      });
      return transaction;
    } catch (error) {
      logger.error('Contract call failed:', error);
      throw error;
    }
  }

  async sendTransaction(tx: {
    function: string;
    arguments: unknown[];
    type_arguments?: string[];
  }): Promise<string> {
    try {
      const transaction = await this.client.submitTransaction({
        function: tx.function,
        type_arguments: tx.type_arguments || [],
        arguments: tx.arguments
      });
      
      const result = await this.client.waitForTransaction({
        transactionHash: transaction.hash
      });
      
      return result.hash;
    } catch (error) {
      logger.error('Transaction failed:', error);
      throw error;
    }
  }

  async queryHeroData(address: string): Promise<unknown> {
    try {
      const heroData = await this.client.view({
        function: `${process.env.APTOS_HERO_CONTRACT_ADDRESS}::hero::get_hero_data`,
        type_arguments: [],
        arguments: [address]
      });
      return heroData;
    } catch (error) {
      logger.error('Failed to query hero data:', error);
      throw error;
    }
  }

  async queryNFTData(tokenId: string): Promise<unknown> {
    try {
      const nftData = await this.client.getTokenData({
        tokenId
      });
      return nftData;
    } catch (error) {
      logger.error('Failed to query NFT data:', error);
      throw error;
    }
  }
} 