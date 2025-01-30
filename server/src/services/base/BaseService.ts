import { randomUUID } from 'node:crypto';
import { ServiceRegistry, ServiceRole, ServiceStatus, ServiceNode } from '../discovery/ServiceRegistry';
import { logger } from '../../utils/logger';

export abstract class BaseService {
  protected readonly nodeId: string;
  protected readonly role: ServiceRole;
  protected readonly registry: ServiceRegistry;
  protected status: ServiceStatus;
  protected capabilities: string[];

  constructor(role: ServiceRole, capabilities: string[] = []) {
    this.nodeId = randomUUID();
    this.role = role;
    this.registry = ServiceRegistry.getInstance();
    this.status = ServiceStatus.STARTING;
    this.capabilities = capabilities;
  }

  public async start(): Promise<void> {
    try {
      await this.initialize();
      this.registerWithRegistry();
      await this.startHeartbeat();
      this.status = ServiceStatus.ACTIVE;
      logger.info(`Service ${this.role} started with node ID: ${this.nodeId}`);
    } catch (error) {
      logger.error(`Failed to start service ${this.role}:`, error);
      this.status = ServiceStatus.FAILING;
      throw error;
    }
  }

  public async stop(): Promise<void> {
    try {
      this.status = ServiceStatus.INACTIVE;
      await this.cleanup();
      this.registry.deregisterNode(this.nodeId);
      logger.info(`Service ${this.role} stopped: ${this.nodeId}`);
    } catch (error) {
      logger.error(`Error stopping service ${this.role}:`, error);
      throw error;
    }
  }

  protected abstract initialize(): Promise<void>;
  protected abstract cleanup(): Promise<void>;

  private registerWithRegistry(): void {
    const node: ServiceNode = {
      id: this.nodeId,
      role: this.role,
      status: this.status,
      address: this.getServiceAddress(),
      publicKey: this.getPublicKey(),
      lastHeartbeat: Date.now(),
      capabilities: this.capabilities,
      metrics: this.getMetrics()
    };

    this.registry.registerNode(node);
  }

  private async startHeartbeat(): Promise<void> {
    setInterval(() => {
      const metrics = this.getMetrics();
      const node: ServiceNode = {
        id: this.nodeId,
        role: this.role,
        status: this.status,
        address: this.getServiceAddress(),
        publicKey: this.getPublicKey(),
        lastHeartbeat: Date.now(),
        capabilities: this.capabilities,
        metrics
      };

      this.registry.updateNodeStatus(this.nodeId, this.status);
    }, 15000); // 15 seconds interval
  }

  protected getServiceAddress(): string {
    return `http://localhost:${process.env.PORT || 3000}`;
  }

  protected getPublicKey(): string {
    // In a real implementation, this would be the node's actual public key
    return `${this.nodeId}_public_key`;
  }

  protected getMetrics(): { cpu: number; memory: number; latency: number } {
    // In a real implementation, these would be actual system metrics
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      latency: Math.random() * 1000
    };
  }

  public getStatus(): ServiceStatus {
    return this.status;
  }

  public getNodeId(): string {
    return this.nodeId;
  }

  protected async becomeBackup(): Promise<void> {
    this.status = ServiceStatus.BACKUP;
    logger.info(`Service ${this.role} becoming backup: ${this.nodeId}`);
  }

  protected async becomeActive(): Promise<void> {
    this.status = ServiceStatus.ACTIVE;
    logger.info(`Service ${this.role} becoming active: ${this.nodeId}`);
  }

  protected isLeader(): boolean {
    const leader = this.registry.getRoleLeader(this.role);
    return leader?.id === this.nodeId;
  }
} 