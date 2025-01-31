# Arcadia

## System Architecture

```mermaid
graph TD
    subgraph Client Layer
        A[Game Client]
    end

    subgraph Service Layer
        subgraph Auth Service Cluster
            C1[Auth Service Primary]
            C2[Auth Service Backup]
        end

        subgraph Game Service
            D1[Game Basic Service]
            D2[Game Compute Service]
        end

        subgraph City Service Cluster
            M1[City Server 1]
            M2[City Server 2]
            subgraph Map Services
                MP1[Map Service 1]
                MP2[Map Service 2]
            end
        end

        E[Chain Service]
    end

    subgraph Chain Layer
        F[Chain Adapter]
        G[Different Blockchains]
    end

    %% Client Layer connections
    A --> C1
    A --> D2

    %% Auth Service connections
    C1 -.->|Failover| C2
    C2 -.->|Monitor| C1

    %% Game Service connections
    D1 --> E
    D2 --> D1
    D2 --> M1
    D2 --> M2

    %% City Service connections
    M1 --> MP1
    M1 --> MP2
    M2 --> MP1
    M2 --> MP2

    %% Chain Layer connections
    E --> F
    F --> G

    %% Service Discovery and Recovery
    C1 -.->|Health Check| D1
    C1 -.->|Health Check| D2
    D1 -.->|Health Check| M1
    D1 -.->|Health Check| M2

    classDef primary fill:#f96,stroke:#333,stroke-width:2px
    classDef backup fill:#69f,stroke:#333,stroke-width:2px
    classDef compute fill:#9f6,stroke:#333,stroke-width:2px
    
    class C1 primary
    class C2 backup
    class D2 compute
```

## Service Components

1. **节点注册/节点验证组件**：依赖链上合约注册和节点提供 API。
2. **服务注册/服务发现组件**：依赖节点运行此服务。
3. **用户注册/登录组件**：处理用户的注册和认证。
4. **链交互组件**：负责与区块链的交互。

### 可选服务组件

- 至少运行一个可选的业务组件
- **游戏服务组件**：处理游戏逻辑和数据。
- **内容评论组件**：管理用户评论。
- **物品交易组件**：处理物品的买卖。
- **资产发行组件**：管理数字资产的发行。
- **更多组件**：根据需求添加。

### 架构设计

- **API 服务**：所有服务组件通过 API 提供对外服务。
- **服务组件间通信**：主要通过 API 通信，部分采用进程内通信。
- **服务发现**：通过服务发现组件获取依赖服务。
- **节点**：运行服务组件的服务器，每个节点可选择运行相关组件。

## Service Discovery and Recovery

### Health Check Protocol
1. Each service registers with Auth Service
2. Regular heartbeat signals
3. Service state monitoring
4. Automatic failover triggers

### Service Recovery Process
1. Detection: Auth Service detects node failure
2. Election: Backup nodes participate in election
3. Promotion: Selected node becomes primary
4. State Recovery: Load state from blockchain
5. Service Resumption: New node takes over

### Permissionless Node Participation
1. Node Registration
   - Generate keypair
   - Register on chain
   - Obtain node address
   - Join service network

2. Role Assignment
   - Capability declaration
   - State synchronization
   - Service integration

3. Monitoring and Validation
   - Performance monitoring
   - State validation
   - Reputation tracking

4. Graceful Exit
   - State handover
   - Network notification
   - Chain record update

## API 设计

### 1. 节点 API

#### 1.1 节点注册
```
POST /api/v1/node/register
Headers:
  - x-node-address
  - x-node-sign
Body:
  - publicKey: string
  - ip: string
  - port: number
```

#### 1.2 节点认证
```
POST /api/v1/node/auth
Headers:
  - x-node-address
  - x-node-sign
Body:
  - timestamp: number
```

### 2. 用户 API

#### 2.1 用户认证
```
POST /api/v1/user/auth
Headers:
  - x-chain-id
  - x-wallet-address
  - x-user-sign
Body:
  - challenge: string
```

#### 2.2 创建英雄
```
POST /api/v1/hero/create
Headers:
  - x-chain-id
  - x-wallet-address
  - x-user-sign
  - Authorization: Bearer <token>
Body:
  - nftId: string
  - name: string
  - class: string
  - race: string
```

#### 2.3 加载英雄数据
```
GET /api/v1/hero/load
Headers:
  - x-chain-id
  - x-wallet-address
  - Authorization: Bearer <token>
```

#### 2.4 保存英雄数据
```
POST /api/v1/hero/save
Headers:
  - x-chain-id
  - x-wallet-address
  - x-user-sign
  - Authorization: Bearer <token>
Body:
  - heroData: HeroData
```

### 3. 错误处理

#### 3.1 错误码设计
- 1000-1999: 系统错误
- 2000-2999: 认证错误
- 3000-3999: 业务错误
- 4000-4999: 链交互错误

#### 3.2 错误响应格式
```typescript
interface ErrorResponse {
    code: number;
    message: string;
    details?: any;
}
```

## 开发规范

### 1. 代码规范
- 使用 TypeScript
- 遵循 ESLint 规则
- 使用 Prettier 格式化
- 编写单元测试

### 2. 文档规范
- API 文档使用 OpenAPI 3.0
- 代码注释遵循 JSDoc
- 更新 CHANGELOG
- 维护 README

### 3. 部署规范
- 使用 Docker 容器化
- CI/CD自动化部署
- 环境配置分离
- 日志规范化 _MODULE_PUBLISHER_ACCOUNT_PRIVATE_KEY=
