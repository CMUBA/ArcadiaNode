import { create as createIPFSClient } from 'ipfs-http-client';
import { ethers } from 'ethers';
import type { HealthStatus } from '../types';
import os from 'node:os';

export class HealthCheckService {
  private ipfsClient;
  private provider;
  private contractAddress: string;
  private lastStatus: HealthStatus;

  constructor(ipfsEndpoint: string, rpcUrl: string, contractAddress: string) {
    this.ipfsClient = createIPFSClient({ url: ipfsEndpoint });
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contractAddress = contractAddress;
    this.lastStatus = this.getInitialStatus();
  }

  private getInitialStatus(): HealthStatus {
    return {
      ipfsConnected: false,
      contractConnected: false,
      apiAvailable: true,
      resourceUsage: {
        cpu: 0,
        memory: 0,
        disk: 0
      },
      lastChecked: Date.now()
    };
  }

  private async checkIPFSConnection(): Promise<boolean> {
    try {
      await this.ipfsClient.id();
      return true;
    } catch {
      return false;
    }
  }

  private async checkContractConnection(): Promise<boolean> {
    try {
      await this.provider.getCode(this.contractAddress);
      return true;
    } catch {
      return false;
    }
  }

  private getResourceUsage() {
    const cpuUsage = os.loadavg()[0];
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const memoryUsage = ((totalMemory - freeMemory) / totalMemory) * 100;

    return {
      cpu: cpuUsage,
      memory: memoryUsage,
      disk: 0 // Implement disk usage check if needed
    };
  }

  public async check(): Promise<HealthStatus> {
    this.lastStatus = {
      ipfsConnected: await this.checkIPFSConnection(),
      contractConnected: await this.checkContractConnection(),
      apiAvailable: true,
      resourceUsage: this.getResourceUsage(),
      lastChecked: Date.now()
    };

    return this.lastStatus;
  }

  public getLastStatus(): HealthStatus {
    return this.lastStatus;
  }
} 