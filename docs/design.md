export default {
    title: 'Arcadia Node - 服务导航',
    nodeManagement: '节点管理',
    nodeRegister: '节点注册',
    healthCheck: '健康检测',
    serviceManagement: '服务管理',
    serviceDiscovery: '服务注册与发现',
    userManagement: '用户管理',
    userAuth: '用户注册与登录',
    chainInteraction: '链交互',
    heroDataManagement: '英雄数据管理',
    contractManagement: '合约管理',
    contracts: {
        token: '代币合约',
        stakeManager: '质押管理合约',
        nodeRegistry: '节点注册合约'
    },
    language: '语言',
    registeredNodes: '已注册节点',
    // Node Register Page
    nodeRegisterTitle: '节点注册',
    registerNewNode: '注册新节点',
    backToHome: '返回首页',
    nodeAddress: '节点地址',
    ipOrDomain: 'IP/域名',
    apiServices: 'API 服务',
    register: '注册',
    // Node Registry Info Page
    nodeRegistryInfoTitle: '节点注册信息',
    queryNodeInfo: '查询节点信息',
    enterNodeAddress: '输入节点地址',
    query: '查询',
    contractAddress: '合约地址',
    status: '状态',
    minStakeAmount: '最低质押金额',
    totalNodes: '节点总数',
    registrationTime: '注册时间',
    active: '活跃',
    // Service Management Page
    serviceManageTitle: '服务管理',
    selectNode: '选择节点',
    serviceIndex: '服务索引',
    serviceName: '服务名称',
    serviceUrl: '服务地址',
    serviceDescription: '描述',
    serviceType: '类型',
    loading: '加载中...',
    noServices: '暂无可用服务',
    basic: '基础服务',
    extend: '扩展服务'
};  extend: '扩展'
}; 
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

新节点注册有两个验证：
1. 新节点是否 address、公钥、challenge 挑战签名是否一致（注册服务节点提供）
2. 新节点是否已经质押（链上合约验证）
3. 注册服务节点提交交易（必须有 chain service 提供）
4. 是否运行自我注册？鉴于挑战字符串是随机生成的，新节点无法提前知道，所以需要注册服务节点提供挑战字符串，然后获得 jwt，提交注册信息，注册服务节点帮助注册到合约。
5.  - 合约部署者自动成为第一个注册者
   - 只有注册者可以帮助其他节点注册


##### Graph
sequenceDiagram
    participant NewNode as 新节点
    participant API as 注册服务节点
    participant Contract as 链上合约

    NewNode->>API: 1. GET /api/v1/node/get-challenge
    API->>Contract: 2. getChallenge()
    Contract-->>API: 3. 返回挑战字符串
    API-->>NewNode: 4. 返回挑战字符串

    NewNode->>NewNode: 5. 使用私钥签名挑战
    NewNode->>API: 6. POST /api/v1/node/sign
    API->>API: 7. 验证签名
    API-->>NewNode: 8. 返回 JWT token

    NewNode->>API: 9. POST /api/v1/node/register (带 JWT)
    API->>Contract: 10. registerNodeByRegistrar()
    Contract-->>API: 11. 注册结果
    API-->>NewNode: 12. 返回注册结果

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

The registration process now works as follows:
A node obtains a challenge from the API
The node signs this challenge with their private key
3. When registering, they provide:
Their node address
IP/Domain
API indexes (as a JSON string of indexes)
The challenge
Their signature of the challenge
The contract verifies:
The registrar is a registered node
The new node isn't already registered
The signature is valid for the provided challenge
The node has sufficient stake


#### 1.2 节点认证
```
POST /api/v1/node/auth
Headers:
  - x-node-address
  - x-node-sign
Body:
  - timestamp: number
```

##### 节点查看
```
GET /api/v1/node/get
Headers:
  - x-node-address
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

## 目录结构
root/
├── node_modules/        # 所有依赖
├── data/               # 服务配置数据
│   └── service_list.json # 服务列表配置
├── docs/               # 项目文档
│   └── design.md       # 系统设计文档
├── .env                # 环境变量
├── .env.example        # 环境变量示例
├── app.js             # 主入口文件
├── package.json       # 项目配置
│
├── server/            # 基础服务
│   ├── node/         # 节点服务
│   ├── service/      # 服务发现
│   ├── user/         # 用户服务
│   ├── chain/        # 链服务
│   └── health/       # 健康检查
│
└── serverx/          # 扩展服务
    ├── gamex/        # 游戏服务
    ├── comment/      # 评论服务
    ├── item/         # 物品服务
    └── asset/        # 资产服务


## Node 思考

Node 从物理上来看，是社区计算节点，从逻辑上来看，是去中心无需许可的服务节点，提供多种服务：https://cmuba.notion.site/AAStar-Plan-Page-1466900e50b6806daac7d86da7c64951?pvs=4。
![](https://raw.githubusercontent.com/jhfnetboy/MarkDownImg/main/img/202502021341721.png)

### 节点结构

如上所言，AAStar 提供所有的基础服务框架的开发，升级和部署，以及后续的基础维护。
而任何社区，可以独立运行自己的服务节点，例如用于自己的去中心化论坛，用于自定义的 ENS 体系，拥有发行自己徽章的体系，有自己的积分体系，有自动机的帐号体系。
扩展服务框架的开发，例如游戏服务，内容评论服务，物品交易服务，资产发行服务等，会依赖合作组织，任何组织都可以基于 AAStar 提供的基础设施来开发自己的应用体系。

节点是去中心无需许可的服务节点，提供多种服务，每个节点可以提供多种服务，每个服务可以有多个实例，每个实例可以有多个节点。
目标是随时有退出，有关机，有加入，是一个动态的真菌网络一样的协作模式，基于去中心计算，基于区块链的协作模式，来构建创新型的社会关系。

### 1. 节点加入

目前基础功能已经完成，测试网功能完成 v0.1，需要测试网测试和优化通过后，再进行主网部署。
1.发行了测试社区代币 Mushroom（🍄 限量 2100 万）
2.建立了社区 测试网 stake 合约
3.建立了社区测试网节点注册合约
4.建立了 测试网节点注册的注册流程

### 2. 节点服务

所有节点必须持续提供服务，奖励会根据节点提供服务的质量进行分配。
目前计划 slash，但较少，还未设计，较低优先级。

### 3. 节点奖励

奖励的计算是根据你启动的：
1.基础服务
2.扩展服务，如游戏服务
3.其他服务，如 AI 服务
来奖励积分 PNTs 节点监控/奖励，每次交互，都会奖励积分 PNTs。


### 4. 服务类型列表

分为三种类型，适合不同的服务节点选择
1.基础计算服务，常规的个人电脑，能够提供并发 1000+ 的计算服务，例如 web 服务，备注服务，验证服务等。
2.高性能计算服务，能够提供并发 3000+ 的计算服务，例如游戏服务，提供某个城市地图的计算服务
3.AI 服务，能够提供并发 3000+ 的 AI 计算服务，需要有 4090 以上芯片，跑 LLM Ollama 服务，例如 ComfyUI，作图，视频生成，提供 AI 计算服务




### 插件 discuss
add post
curl -X POST http://localhost:3017/api/v1/discuss/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "First Post",
    "content": "Hello World!",
    "author": "0x123...",
    "category": "General",
    "tags": ["hello", "test"]
  }'

  get post
  curl http://localhost:3017/api/v1/discuss/posts

  filter
  curl http://localhost:3017/api/v1/discuss/posts?category=General

  comment
  curl -X POST http://localhost:3017/api/v1/discuss/posts/[CID]/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Great post!",
    "author": "0x456..."
  }'


  server/
  plugins/
    example-discuss/
      index.js          # 插件后端入口
      public/           # 插件前端资源
        index.html      # 论坛前端入口
        styles/         # 样式文件
        scripts/        # 前端脚本
      package.json      # 插件依赖
      plugin.json       # 插件配置

      

### ENS 域名系统
是的，在 ENS (Ethereum Name Service) 域名系统中，你可以为一级、二级和三级域名设置 text（TXT）记录。Text 记录可以用于存储各种额外的信息，比如：

个人简介
社交媒体账号
网站链接
电子邮件
联系方式
其他自定义信息
设置 text 记录的语法通常是这样的：

ini
key1=value1, key2=value2, key3=value3  
例如：

twitter=@username, github=yourprofile, email=contact@example.com
website=https://example.com, description=Blockchain developer
注意事项：

使用逗号和空格分隔不同的 key-value 对
确保使用有效的键值对
记录长度和数量可能有限制
你可以通过 ENS 管理界面或使用支持 ENS 的钱包来设置这些 text 记录。



## ServerTypeScript 迁移补充分析

### 服务端文件分析
1. 核心服务文件
   - server/index.js -> index.ts
   - server/core/*.js -> core/*.ts
   - server/utils/*.js -> utils/*.ts
   - server/middleware/*.js -> middleware/*.ts

2. 插件系统相关
   - server/plugins/plugin-manager.js -> plugins/plugin-manager.ts
   - server/plugins/plugin-loader.js -> plugins/plugin-loader.ts
   - server/plugins/types.ts (新增，定义插件相关类型)

3. API 路由
   - server/routes/*.js -> routes/*.ts
   - server/controllers/*.js -> controllers/*.ts

### 类型定义补充
```typescript
// types/plugin.d.ts
interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
}

interface PluginHealth {
  status: 'healthy' | 'unhealthy';
  message?: string;
  details?: Record<string, any>;
  timestamp: number;
}

interface PluginAPI {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: (req: Request, res: Response) => Promise<void>;
  middleware?: Array<(req: Request, res: Response, next: NextFunction) => void>;
}

interface PluginLifecycle {
  onInstall?: () => Promise<void>;
  onUninstall?: () => Promise<void>;
  onUpdate?: (fromVersion: string) => Promise<void>;
  onEnable?: () => Promise<void>;
  onDisable?: () => Promise<void>;
}
```

### 构建工具链补充
1. 开发环境
   ```json
   {
     "scripts": {
       "dev": "ts-node-dev --respawn src/index.ts",
       "build": "tsc",
       "start": "node dist/index.js",
       "type-check": "tsc --noEmit",
       "lint": "eslint . --ext .ts",
       "test": "jest"
     }
   }
   ```

2. ESLint 配置补充
   ```json
   {
     "extends": [
       "eslint:recommended",
       "plugin:@typescript-eslint/recommended",
       "plugin:@typescript-eslint/recommended-requiring-type-checking"
     ],
     "rules": {
       "@typescript-eslint/explicit-function-return-type": "error",
       "@typescript-eslint/no-explicit-any": "warn",
       "@typescript-eslint/no-unused-vars": "error"
     }
   }
   ```

### 插件系统类型安全
```typescript
// plugins/plugin-manager.ts
class PluginManager {
  private plugins: Map<string, Plugin> = new Map();
  private health: Map<string, PluginHealth> = new Map();

  async loadPlugin(name: string): Promise<void> {
    const plugin = await this.validateAndLoad(name);
    this.plugins.set(name, plugin);
    await this.startHealthCheck(name);
  }

  private async validateAndLoad(name: string): Promise<Plugin> {
    const config = await this.loadConfig(name);
    this.validateConfig(config);
    return this.createPluginInstance(config);
  }

  private async startHealthCheck(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) return;

    setInterval(async () => {
      try {
        const health = await plugin.healthCheck();
        this.health.set(name, {
          ...health,
          timestamp: Date.now()
        });
      } catch (error) {
        this.health.set(name, {
          status: 'unhealthy',
          message: error.message,
          timestamp: Date.now()
        });
      }
    }, 30000); // 每 30 秒检查一次
  }
}
```

### 迁移风险补充
1. 插件兼容性
   - 需要为现有的 JS 插件提供类型定义
   - 可能需要修改插件加载机制以支持 TypeScript
   - 考虑向后兼容性

2. 运行时性能
   - TypeScript 编译后的代码可能略微增加
   - 需要优化类型检查的性能开销
   - 考虑增量编译策略

3. 开发体验
   - 需要更新开发文档
   - 提供插件开发模板
   - 完善类型提示和自动补全

### 迁移策略补充
1. 渐进式迁移
   - 先迁移核心功能
   - 保持插件系统的向后兼容
   - 逐步更新插件

2. 测试策略
   - 单元测试覆盖核心功能
   - 集成测试确保插件系统正常
   - 性能测试对比迁移前后

3. 文档更新
   - 更新开发指南
   - 提供 TypeScript 最佳实践
   - 编写插件开发教程

