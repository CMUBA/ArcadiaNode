import express from 'express';
import { HealthCheckService } from './services/health';
import type { PluginConfig } from './types';

export class DiscussPlugin {
  private app;
  private healthCheck: HealthCheckService;
  private config: PluginConfig;

  constructor(config: PluginConfig) {
    this.config = config;
    this.app = express();
    this.healthCheck = new HealthCheckService(
      config.ipfsEndpoint,
      config.rpcUrl,
      config.contractAddress
    );

    this.setupRoutes();
    this.startHealthCheck();
  }

  private setupRoutes() {
    // Health check endpoint
    this.app.get('/health', async (req, res) => {
      const status = await this.healthCheck.check();
      res.json(status);
    });

    // TODO: Add other API routes
  }

  private startHealthCheck() {
    // Run health check every minute
    setInterval(async () => {
      await this.healthCheck.check();
    }, 60000);
  }

  public start() {
    this.app.listen(this.config.apiPort, () => {
      console.log(`Discussion plugin listening on port ${this.config.apiPort}`);
    });
  }
}

// Export plugin factory function
export function createPlugin(config: PluginConfig) {
  return new DiscussPlugin(config);
} 