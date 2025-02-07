export interface Topic {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  timestamp: number;
  ipfsHash: string;
  tags: string[];
  votes: number;
}

export interface Comment {
  id: string;
  topicId: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  timestamp: number;
  ipfsHash: string;
  votes: number;
}

export interface HealthStatus {
  ipfsConnected: boolean;
  apiAvailable: boolean;
  userServiceConnected: boolean;
  resourceUsage: {
    cpu: number;
    memory: number;
    disk: number;
  };
  lastChecked: number;
}

export interface PluginConfig {
  ipfsEndpoint: string;
  userServiceEndpoint: string;
  apiPort: number;
} 