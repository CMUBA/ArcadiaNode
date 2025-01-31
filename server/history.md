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

- **游戏服务组件**：处理游戏逻辑和数据。
- **内容评论组件**：管理用户评论。
- **物品交易组件**：处理物品的买卖。
- **资产发行组件**：管理数字资产的发行。

### 架构设计

- **API 服务**：所有服务组件通过 API 提供对外服务。
- **服务组件间通信**：主要通过 API 通信，部分采用进程内通信。
- **服务发现**：通过服务发现组件获取依赖服务。
- **节点**：运行服务组件的服务器，每个节点可选择运行相关组件。


## Old

### Website Module
- NFT Creation and Minting
- NFT Marketplace
- User Authentication
- Wallet Connection

### Game Basic Service
- Hero Data Management
- Basic Game Logic
- Chain Interaction
- Data Persistence

### Game Compute Service
- Game Logic Processing
- Data Validation
- Combat Calculations
- State Management

### City Service
- City State Management
- Player Interaction
- Resource Management
- Map Service Integration

### Map Service
- Terrain Management
- Position Tracking
- Movement Validation
- Area Effects

### Auth Service
- JWT Token Management
- Node Authentication
- User Authentication
- Service Discovery
- Health Monitoring
- Failover Management

### Chain Service
- Multi-chain Support
- Contract Interaction
- Transaction Processing
- Data Synchronization


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

## Questions I ask AI


### idea1

对于架构，我们有预期如下：
   1> server 端服务将由 nodejs 技术栈提供对外的 API 服务
   2> server 端的部署将会部署为多个服务组件，每个组件之间多数采用 API 通信，也有进程内通信
   3> 服务组件直接是弱依赖关系，可以通过服务发现组件来获得自己的依赖组件服务
    4>所有运行服务组件的服务器，称为 node，每个 node 可选运行相关的组件
    5> 目前已确认的服务组件：
     节点注册/节点验证组件 (依赖链上合约注册和 node 提供 api）
      服务注册/服务发现组件（依赖 node 运行此服务）
      用户注册/登陆组件
      链交互组件
以下是可选组件（node 选择一个服务组件运行）
      游戏服务组件
      内容 commnet 组件
      Item 交易
      资产发行组件
      等等
      每个组件都是一个服务，同时依赖其他服务

### idea2

server 目录将运行基础的服务，对外提供 API 服务，同时依赖其他服务
包括：
1. Node Management: 节点注册/节点验证组件 (依赖链上合约注册和 node 提供 api）
2. Service : 服务注册/服务发现组件（依赖 node 运行此服务）
3. User: 用户注册/登陆组件和更多的账户生命周期服务组件
4. Chain : 链交互组件
以上是基础组件，在 server 内实现，以下是可选组件，独立目录实现，由一个根目录的统一入口 app.js，来加载 server 内和可选组件，统一管理路由，server 内部访问是/api/v1/service/xxx，外部访问是/apiex/v1/game/xxx
1. Game : 游戏服务组件
2. Comment : 内容 commnet 组件
3. Item : Item 交易
4. Asset : 资产发行组件
5.  更多的 Cos72 规划的组件模块


#### Node Management

1. 运行在 docker，也可以 clone github 代码自己运行，可以一键根据 github 更新，发布新 image
2. 新运行的 docker 镜像，内置了 node.cmuba.org 来发现其他节点，也可以自己访问 node 注册合约来获得其他 node 服务地址（域名）
3. 启动自己的 docker 服务，自检是否注册（获得了 node register address，一个 hash 值）
4. 如果没有，则进入 node 注册页面，默认调用 ether.js 来生成自己的 key pair，然后寻找内置服务发现的 api，获得一个 node 域名或者 ip list
5. 例如我们获得了 node.cmuba.org 作为默认服务发现节点，则 https://node.cmuba.org/get_routes_list，就是我们获得更多 list 的默认接口
6. 这个接口返回{
   "server_list": ["node.cmuba.org", "node.cmuba.org", "node.cmuba.org"],
   "API_list": ["/api/v1/node/register", "/api/v1/node/auth", "/api/v1/node/heartbeat", "/api/v1/node/routes_list"],
   "support_API_list": [{1,2,4},{1,2,5},{1,2,6},{1,2,7}],
   }
7. 新 node 访问/api/v1/node/register，首先提供自己的基础信息：ip, port, publicKey, node_address(就是 keypair 的 walletaddress)，获得一个 jwt 用于加密后续通信
8. 携带 jwt 访问 register，如果没有签名参数直接访问，则返回一个随机字符串作为 challenge，然后新 node 使用本地私钥对 challenge 进行签名，组合{challenge, signature, timestamp, ip, port, publicKey, node_address(就是 keypair 的 walletaddress)}post 到/api/v1/node/register
9. 使用 jwt 加密{challenge, signature, timestamp, ip, port, publicKey, node_address(就是 keypair 的 walletaddress)}，post 到/api/v1/node/register
10. 如果注册成功，则可以写入了链上合约，并进入了访问的 node 的 routes_list 列表，被动同步到其他节点（其他节点会定期访问链上合约）
11. jwt 只使用这一次注册过程，然后成功后则失效，其他 node 提供的是一个 validate 公钥和签名的验证服务，然后提交一个交易到链上合约的服务
12. 在后续注册过程，需要访问 node.cmuba.org 页面，进行 stake，stake 获得对应的钱包地址和 stake 的金额，然后提交一个交易到链上合约的服务，stake 钱包可以是其他钱包，但 stake 之后转账到 node 地址，才可以进行注册，本次先不实现这个功能

##### node 注册合约
1. 部署在 OP 链，未来暂时不会部署到其他链
2. 合约地址：0x0000000000000000000000000000000000000000
3. 合约部署脚本：github.com/cmuba/node-register-contract
4. 合约部署后，会自动将合约地址写入到 node.cmuba.org 的合约地址列表中

##### node stake 合约
1. 暂时不开发
2. 思路是购买 MRM 治理 token，stake 到 OP 的合约，获得一个 staker 的凭证，然后使用这个凭证（node 地址绑定了）进行注册，后续就是正常 node 注册过程：获得一个 jwt，然后使用 jwt 进行后续的通信等等
3. stake 就可以获得加入蘑菇网络的资格，不同服务，stake 的金额不同

##### Service list
任何 node 都提供服务发现的 api 接口，返回的其实包含了一个全量的 APIlist，这个 list 会维护在 https://github.com/cmuba/service-list-contract,同时链上也有一个同步更新，这个更新由协议维护小组来维护和更新
包括了 (1-4 是必选)
  1. 节点注册/节点验证组件 (依赖链上合约注册和 node 提供 api）
     1. "/api/v1/node/register" 
  2. 服务注册/服务发现组件（依赖 node 运行此服务）
     1. "/api/v1/node/routes_list"
  3. 用户注册/登陆组件
     1. "/api/v1/user/register"
     2. "/api/v1/user/login"
  4. 健康检测组件
     1. "/api/v1/node/heartbeat"
  5. 链交互组件
     1. "/api/v1/chain/hero/create"
     2. "/api/v1/chain/hero/load"
     3. "/api/v1/chain/hero/save"
  6. 游戏服务组件
     1. "/api/v1/game/hero/create"
     2. "/api/v1/game/town/interaction"
     3. "/api/v1/game/town/trigger"
     4. "/api/v1/game/player/levelup"
     5. "/api/v1/game/play/reward"
  7. 内容 commnet 组件
     1. "/api/v1/comment/create"
     2. "/api/v1/comment/load"
     3. "/api/v1/comment/save"
  8. Item 交易
     1. "/api/v1/item/buy"
     2. "/api/v1/item/sell"
  9.  资产发行组件
     1. "/api/v1/asset/create"
     2. "/api/v1/asset/load"
     3. "/api/v1/asset/save"
  10. 等等


#### Service Management

1. 基于 node 的注册，node 可以提供一个服务发现组件，然后提供一个服务发现组件的地址，然后其他 node 可以访问这个地址，获得其他服务的地址，然后进行通信
2. node.cmuba.org/service_discovery 提供一个服务发现的接口，用于发现此 node 提供服务的 api list，然后其他 node 可以访问这个地址，获得有效 api list，使用服务，结构如下： {   "API_list": ["/api/v1/node/register", "/api/v1/node/auth", "/api/v1/node/heartbeat", "/api/v1/node/routes_list", "/api/v1/user/register", "/api/v1/user/login", "/api/v1/chain/hero/create", "/api/v1/chain/hero/load", "/api/v1/chain/hero/save"],
   "support_API_list": [1,2,3,7],
   }
3. node.cmuba.org/health_check 提供一个健康检查的接口，用于检查 node 的健康状态，如果 node 健康，则返回一个 200 状态码，否则返回一个 500 状态码


## backup
# Arcadia Game Server

## 架构设计

### 1. 系统架构
```mermaid
graph TD
    A[Game Client] --> B[API Gateway]
    B --> C[Auth Service]
    B --> D[Game Service]
    B --> E[Chain Service]
    E --> F[Chain Adapter]
    F --> G[Different Blockchains]
```

### 2. 核心服务

#### 2.1 认证服务 (Auth Service)
- JWT Token 管理
- 节点认证
- 用户认证
- 签名验证

#### 2.2 游戏服务 (Game Service)
- 英雄数据管理
- 游戏逻辑处理
- 数据持久化
- 事件处理

#### 2.3 链服务 (Chain Service)
- 多链适配
- 合约交互
- 交易处理
- 数据同步

### 3. 数据流

#### 3.1 用户操作流程
1. 客户端发起请求
2. 网关验证基础参数
3. Auth Service 验证身份
4. Game Service 处理游戏逻辑
5. Chain Service 处理链上交互
6. 返回结果给客户端

#### 3.2 节点注册流程
1. 节点生成密钥对
2. 向合约注册节点
3. 获取节点地址
4. 定期更新 JWT Token

### 4. 安全设计

#### 4.1 通信安全
- 所有 API 使用 HTTPS
- 请求签名验证
- JWT Token 认证
- 节点间通信加密

#### 4.2 数据安全
- 敏感数据加密存储
- 私钥离线存储
- 定期数据备份
- 访问权限控制

### 5. 多链适配设计

#### 5.1 链适配器接口
```typescript
interface IChainAdapter {
    // 基础方法
    connect(): Promise<boolean>;
    disconnect(): Promise<void>;
    getBalance(address: string): Promise<string>;
    
    // 合约交互
    callContract(address: string, method: string, params: any[]): Promise<any>;
    sendTransaction(tx: Transaction): Promise<string>;
    
    // 数据查询
    queryHeroData(address: string): Promise<HeroData>;
    queryNFTData(tokenId: string): Promise<NFTData>;
}
```

#### 5.2 支持的链
- Aptos
- (预留其他链的扩展)

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
- 日志规范化 

