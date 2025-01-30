import { EventEmitter } from 'events';
import { logger } from '../../utils/logger';

export enum ServiceRole {
  AUTH = 'auth',
  GAME_BASIC = 'game_basic',
  GAME_COMPUTE = 'game_compute',
  CITY = 'city',
  MAP = 'map',
  CHAIN = 'chain'
}

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  STARTING = 'starting',
  FAILING = 'failing',
  BACKUP = 'backup'
}

export interface ServiceNode {
  id: string;
  role: ServiceRole;
  status: ServiceStatus;
  address: string;
  publicKey: string;
  lastHeartbeat: number;
  capabilities: string[];
  metrics: {
    cpu: number;
    memory: number;
    latency: number;
  };
}

export class ServiceRegistry extends EventEmitter {
  private static instance: ServiceRegistry;
  private nodes: Map<string, ServiceNode>;
  private roleLeaders: Map<ServiceRole, string>;
  private heartbeatInterval: number;
  private healthCheckInterval: NodeJS.Timer | null;

  private constructor() {
    super();
    this.nodes = new Map();
    this.roleLeaders = new Map();
    this.heartbeatInterval = 30000; // 30 seconds
    this.healthCheckInterval = null;
    this.startHealthCheck();
  }

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  public registerNode(node: ServiceNode): void {
    this.nodes.set(node.id, node);
    this.emit('nodeRegistered', node);
    this.checkRoleLeadership(node.role);
    logger.info(`Node registered: ${node.id} (${node.role})`);
  }

  public updateNodeStatus(nodeId: string, status: ServiceStatus): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.status = status;
      node.lastHeartbeat = Date.now();
      this.nodes.set(nodeId, node);
      this.emit('nodeStatusUpdated', node);
      this.checkRoleLeadership(node.role);
    }
  }

  public deregisterNode(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (node) {
      this.nodes.delete(nodeId);
      this.emit('nodeDeregistered', node);
      this.checkRoleLeadership(node.role);
      logger.info(`Node deregistered: ${nodeId} (${node.role})`);
    }
  }

  public getActiveNodesForRole(role: ServiceRole): ServiceNode[] {
    return Array.from(this.nodes.values())
      .filter(node => node.role === role && node.status === ServiceStatus.ACTIVE);
  }

  public getRoleLeader(role: ServiceRole): ServiceNode | undefined {
    const leaderId = this.roleLeaders.get(role);
    return leaderId ? this.nodes.get(leaderId) : undefined;
  }

  private checkRoleLeadership(role: ServiceRole): void {
    const activeNodes = this.getActiveNodesForRole(role);
    if (activeNodes.length === 0) {
      // No active nodes, try to promote a backup
      const backupNodes = Array.from(this.nodes.values())
        .filter(node => node.role === role && node.status === ServiceStatus.BACKUP);
      
      if (backupNodes.length > 0) {
        // Select the backup node with the best metrics
        const bestBackup = this.selectBestBackup(backupNodes);
        this.promoteToLeader(bestBackup);
      } else {
        logger.warn(`No available nodes for role: ${role}`);
      }
    }
  }

  private selectBestBackup(backupNodes: ServiceNode[]): ServiceNode {
    return backupNodes.reduce((best, current) => {
      const bestScore = this.calculateNodeScore(best);
      const currentScore = this.calculateNodeScore(current);
      return currentScore > bestScore ? current : best;
    });
  }

  private calculateNodeScore(node: ServiceNode): number {
    const { cpu, memory, latency } = node.metrics;
    // Lower values are better for CPU, memory, and latency
    return (1 - cpu/100) * 0.4 + (1 - memory/100) * 0.3 + (1000 - latency)/1000 * 0.3;
  }

  private promoteToLeader(node: ServiceNode): void {
    node.status = ServiceStatus.ACTIVE;
    this.roleLeaders.set(node.role, node.id);
    this.emit('leaderPromoted', node);
    logger.info(`Node promoted to leader: ${node.id} (${node.role})`);
  }

  private startHealthCheck(): void {
    this.healthCheckInterval = setInterval(() => {
      const now = Date.now();
      this.nodes.forEach((node, nodeId) => {
        if (now - node.lastHeartbeat > this.heartbeatInterval * 2) {
          if (node.status === ServiceStatus.ACTIVE) {
            this.updateNodeStatus(nodeId, ServiceStatus.FAILING);
            logger.warn(`Node ${nodeId} (${node.role}) is failing health check`);
          } else if (node.status === ServiceStatus.FAILING) {
            this.deregisterNode(nodeId);
          }
        }
      });
    }, this.heartbeatInterval);
  }

  public stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }
} 