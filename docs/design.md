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

----------

## Chain service

### 链服务的背景

1. 不同业务，针对不同链，有不同合约依赖和服务
2. 核心是通过 API 方式给上层应用提供基础服务
3. 本次先支持 Etherum OP，Aptos 后续支持更多链
4. 本次服务目标是 Game 业务的链数据服务
5. 未来提供资产发行，资产流通 Swap，资产 stake 等管理服务

### Game 业务链服务基础诉求

1. Create hero：在脸上英雄合约创建新记录
2. Load hero：从链上合约读取英雄数据
3. Save hero：将英雄数据保存到链上合约
4. more

### Hero data structure
游戏是众包运行，虽然协议会有开发自己游戏，因此合约是由社区开发和维护的，不是无主合约。
合约发布者唯一可以操作的是新增 NFT 合约地址，则此合约地址下的 NFT 都可以注册英雄记录。
此外，合约发布者不能删除、修改合约的任何数据。
因此，新增英雄需要提供你购买的 NFT 合约地址和 NFTID（默认是 Ethereum EIP721）

依赖链上数据表合约：
1.依赖技能组合表，此表格默认是{Spring, Summer, Autumn, Winter}四种天赋，每个对应的五种技能的数据特征 //https://whimsical.com/attribute-7Wjz8qDJJzjQbcffNdpUSm
2.依赖种族表，此表格默认是{Human, Elf, Dwarf, Orc, Undead}五种种族
3.依赖职业表，此表格默认是{Warrior, Mage, Archer, Rogue, Priest}五种职业
4.依赖属性表，此表格默认是{Agility, Attack, Health, Defense}四种属性
5.依赖装备表，此表格默认是{Weapon, Armor, Accessory}三种装备，可以对应不同合约地址
6.依赖物品表，此表格默认是{Item}一种物品，可以对应不同合约地址
7.每日能量和积分限制：默认每日能量是 100，积分获得上限是 1000，而进入一个副本，消耗不同能量

所有客户端会下载和缓存此数据结构，用来显示和计算英雄数据。

#### 使用示例

JSON 结构
```
{
    "name": "Hero Name",
    "race": "Human", // default is Human
    "gender": "Male", // default is Male
    "level": 1, // default is 1
    "energy": 100, // default is 100 //进入一次游戏，会扣除一次能量，每次扣除30-100不等，不足则无法进入副本
    "skills": ["Spring":{1,0,0,0,0}, "Summer":{0,1,0,0,0}, "Autumn":{0,0,1,0,0}, "Winter":{0,0,0,1,0}], // 英雄加点的表格或者技能数,例如春天有五个技能，加点在不同技能，有不同级别，每个级别有不同效果（不同的计算数据，存储在依赖表）
    "equipment": ["Weapon 1", "Armor 1", "Accessory 1"], // default is [] //装备的表格，可以对应不同合约地址+NFTid,初期先不管
}
```

## 合约设计

### 元数据表：
1. 依赖技能组合表，此表格默认是{Spring, Summer, Autumn, Winter}四种天赋，每个对应的五种技能的数据特征 //https://whimsical.com/attribute-7Wjz8qDJJzjQbcffNdpUSm
表格和升级使用的积分参考：https://docs.google.com/spreadsheets/d/1MkFvPSKSyondS1gYzdeXYThyXUmEgJhBSjiTPWERlkk/edit?usp=sharing
2. 依赖种族表，此表格默认是{Human, Elf, Dwarf, Orc, Undead}五种种族
3. 依赖职业表，此表格默认是{Warrior, Mage, Archer, Rogue, Priest}五种职业
4. 依赖属性表，此表格默认是{Agility, Attack, Health, Defense}四种属性
5. 依赖装备表，此表格默认是{Weapon, Armor, Accessory}三种装备，可以对应不同合约地址
6. 依赖物品表，此表格默认是{Item}一种物品，可以对应不同合约地址
7. 每日能量和积分限制：默认每日能量是 100，积分获得上限是 1000，而进入一个副本，消耗不同能量

Hero 合约：
支持如下功能：
依赖传入的 NFT 合约地址和 NFTID，来创建英雄记录
数据包括基础的以太坊交易需要的地址，交易签名等

0. 创建依赖数据
   读取链上的依赖合约，缓存到本地，用来做各种业务校验和显示（链上依然会验证一次，但联系对比，失败则快速失败）
   例如技能是{1,0,0,0,0}，则表示春天第一个技能一级，其他技能都是 0 级
   目前包括：
   - 技能组合表 //必须
   - 种族表 //必须
   - 职业表 //必须
   - 属性表 //
   - 装备表 //
   - 物品表 //
   - 每日能量和积分限制 //必须
   - 支持 NFT 合约地址列表 //必须

### 创建英雄
   hero 数据
  ```
  {
    "hero":{
      "name": "Hero Name", //用户输入
      "race": 1, //用户界面选择
      "gender": 1, //用户界面选择
      "level": 1, //新用户强制 1 级，不可修改
      "energy": 100, //用户界面显示，不可修改
      "skills": [{1,0,0,0,0}, {0,1,0,0,0}, {0,0,1,0,0}, {0,0,0,1,0}], //这个要随机生成一个天赋么？ 
      "equipment": []
    },
    "hash": "hash" //本地使用私钥对 hero 数据 hash 后进行签名,初始化是空
  }
  ```

### 读取英雄
   根据登录账户绑定的 wallet address 读取英雄数据，默认根据网络选择来选择网络（不同网络选择，有不同 wallet address）
   1.读取英雄 wallet address 名下的 NFT，和本地缓存的允许注册的 NFT 合约地址对比，如果匹配，则读取 NFT 合约地址+NFTID 对应的英雄数据
   2.如果本地缓存的允许注册的 NFT 合约地址没有匹配，则提示需要购买 NFT；
   3.本地会根据缓存的支持的 NFT 合约 (collection) 数据，来读取合约（collection 地址）的介绍，显示给用户
   4.NFT 合约地址+NFTID 是读取以太坊合约的入口参数，读取 Aptos 合约的入口参数是单独的 NFT 地址（也可能需要 collection 地址）
   5.显示 Hero 数据，多语言显示，包括：
   - 英雄名称
   - 英雄种族
   - 英雄性别
   - 英雄等级
   - 英雄能量
   - 英雄技能
   - 英雄装备


### 保存英雄

   1. 保存机制目前是自动机制，但需要指纹授权，一次有效期 3 小时，只针对英雄合约数据（测试阶段使用手动保存）TODO
   2. 手动保存，随时可以点击游戏内的保存，来调用后台 api 进行保存
   3. 保存是两步进行：先获取 challenge，client 端进行签名再和 hero 数据一起发回 server
   4. server 验证 challenge，然后验证 hero 数据，然后进行保存
   5. 包括：
   - 英雄名称，可以修改（单独通过某个页面修改，然后缓存）
   - 英雄等级（可以通过积分升级）
   - 英雄技能（可以通过积分升级）
   - 英雄装备（新装备购买或者材料合成）
   - 数据结构参考上面的结构，另外提供一个 hash，是链上 hero 数据进行 hash 的结果
   - 是中心化 server 对数据校验的基础，此 hash+server 端 challenge，然后再 hash，在保存时提供
 - 所以保存 hero 需要携带 node 的签名

### 保存的安全校验

1.初始化
hero 合约部署初始化默认新增一个 NFT 合约，接受此 NFT 合约的注册，则部署合约时要提供这个地址作为必须参数
2.异常检测
增加频率限制和异常检测机制，在 server 端，针对每个用户地址，增加频率限制，如果超过则不允许保存
server 端对数据进行合理性校验：例如每日只能玩三次，玩一次记录一次，超过则不允许保存
每局游戏积分有上限，超过则不允许保存，等等
3.双签名
针对链游的保存，设计了一个安全保存机制，目的是防止外挂，防止黑客作弊

   1. 如果黑客绕过服务器，直接（盗取）私钥操作，则合约端同样进行限制
   2. 限制方法是联合签名：
      1. 每次保存，服务器先给 client 返回一个 challenge+ 时间戳（防止重放），client 进行私钥签名
      2. 然后服务器进行私钥签名
      3. 然后合约进行两次解密验证，从而保障只有授权的服务器签名的交易，才允许保存
   3. 所有服务器都在 node registry 进行注册，然后提供外部合约查询接口：根据服务器公钥查询是否注册过

### Node 私钥泄露 TODO
a. 技术层面

使用硬件安全模块 (HSM) 存储私钥
分布式密钥管理
定期轮换私钥
多重签名机制
b. 管理层面

严格访问控制
员工权限最小化
实施安全审计
入侵检测系统
日志监控
c. 应急响应

快速吊销被泄露私钥
备用私钥快速切换
合约层支持私钥注销和更新
综合以上措施，可将私钥泄露风险降到最低。



## 区块链专家建议与后续开发步骤

### 合约架构优化建议

1. **数据分层存储**
   - 将元数据表拆分为独立合约
   - 使用代理模式实现可升级性
   - 实现数据压缩以降低链上存储成本
   ```solidity
   contract HeroMetadata {
       // 使用紧凑编码存储技能数据
       mapping(uint256 => uint8[20]) public skillData; // 4 个天赋 x5 个技能
       // 使用位图存储种族和职业
       mapping(uint256 => uint8) public raceAndClass; 
   }
   ```

2. **访问控制优化**
   - 实现细粒度的权限控制
   - 添加紧急暂停机制
   - 设计多签机制用于关键操作
   ```solidity
   contract HeroAccessControl {
       bytes32 public constant GAME_MANAGER = keccak256("GAME_MANAGER");
       bytes32 public constant DATA_CURATOR = keccak256("DATA_CURATOR");
       
       function updateHeroData(uint256 heroId) external onlyRole(GAME_MANAGER) {
           // 更新逻辑
       }
   }
   ```

3. **跨链互操作性**
   - 实现跨链消息传递接口
   - 设计统一的资产标识符
   - 支持多链数据同步
   ```solidity
   interface ICrossChainHero {
       function verifyHeroData(
           bytes32 sourceChain,
           uint256 heroId,
           bytes calldata proof
       ) external returns (bool);
   }
   ```

### 后续开发步骤

1. **Phase 1: 基础设施搭建**
   - 部署元数据合约集
   - 实现基础的 CRUD 操作
   - 开发测试套件
   ```bash
   # 开发步骤
   1. 编写合约
   2. 本地测试
   3. 测试网部署
   4. 审计
   5. 主网部署
   ```

2. **Phase 2: 安全与优化**
   - 实现数据验证层
   - 添加事件监听和索引
   - 优化 gas 消耗
   ```solidity
   contract HeroValidator {
       event HeroValidated(uint256 indexed heroId, bool success);
       
       function validateHeroData(HeroData memory data) public returns (bool) {
           // 验证逻辑
           emit HeroValidated(data.heroId, true);
           return true;
       }
   }
   ```

3. **Phase 3: 跨链功能**
   - 实现 Aptos 合约
   - 开发跨链桥接器
   - 测试跨链交互
   ```move
   module HeroData {
       struct Hero {
           id: u64,
           owner: address,
           data: vector<u8>,
       }
       
       public fun create_hero(owner: address, data: vector<u8>) {
           // 创建逻辑
       }
   }
   ```

### 技术风险与缓解策略

1. **数据一致性**
   - 实现乐观更新机制
   - 添加状态回滚功能
   - 设计冲突解决策略
   ```solidity
   contract HeroStateManager {
       mapping(uint256 => uint256) public stateNonce;
       mapping(uint256 => HeroState[]) public stateHistory;
       
       function rollbackToNonce(uint256 heroId, uint256 nonce) external {
           require(hasAuthority(msg.sender));
           // 回滚逻辑
       }
   }
   ```

2. **性能优化**
   - 批量处理机制
   - 链下数据存储
   - 状态通道集成
   ```solidity
   contract HeroBatchProcessor {
       function batchUpdateHeroes(uint256[] calldata heroIds, bytes[] calldata updates)
           external returns (bool[] memory results) {
           // 批量更新逻辑
       }
   }
   ```

3. **安全考虑**
   - 实现重入锁
   - 添加速率限制
   - 设计多重签名机制
   ```solidity
   contract HeroSecurity {
       mapping(address => uint256) public lastUpdateTime;
       uint256 public constant UPDATE_COOLDOWN = 1 hours;
       
       modifier rateLimited() {
           require(block.timestamp >= lastUpdateTime[msg.sender] + UPDATE_COOLDOWN);
           _;
           lastUpdateTime[msg.sender] = block.timestamp;
       }
   }
   ```

### API 接口优化

1. **链上数据查询优化**
   ```typescript
   interface IHeroQueryService {
       // 批量查询接口
       function getHeroesByOwner(address owner): Promise<Hero[]>;
       // 分页查询接口
       function getHeroesWithPagination(uint256 offset, uint256 limit): Promise<Hero[]>;
       // 条件过滤接口
       function getHeroesByAttributes(HeroFilter filter): Promise<Hero[]>;
   }
   ```

2. **事件监听与数据同步**
   ```typescript
   interface IHeroEventListener {
       // 监听英雄创建事件
       function onHeroCreated(heroId: number, owner: string): void;
       // 监听属性更新事件
       function onHeroAttributesUpdated(heroId: number, attributes: any): void;
       // 监听装备变更事件
       function onHeroEquipmentChanged(heroId: number, equipment: any): void;
   }
   ```

### 测试策略

1. **单元测试**
   - 合约功能测试
   - 边界条件测试
   - Gas 消耗测试

2. **集成测试**
   - 跨合约交互测试
   - 跨链操作测试
   - 并发操作测试

3. **性能测试**
   - 负载测试
   - 并发测试
   - 网络延迟测试

### 监控与维护

1. **链上监控**
   - 交易状态监控
   - Gas 价格监控
   - 合约事件监控

2. **数据分析**
   - 使用模式分析
   - 性能瓶颈分析
   - 异常行为检测

3. **升级维护**
   - 合约升级计划
   - 数据迁移策略
   - 紧急响应预案


----

先部署 NFT 合约：forge script script/DeployHeroNFT.s.sol
部署 Metadata 合约：forge script script/DeployHeroMetadata.s.sol
最后部署 Hero 合约：forge script script/DeployHero.s.sol
请确保在 optimism/.env 文件中设置了必要的环境变量：

梳理一下三个 hero 合约的逻辑和权限
1.metadta 合约，是部署后就静态读取，可以通过代理合约升级，但是不能修改，只有 owner，部署者有权限升级
2.nft 合约，是部署后任何人都可以 mint，但需要支付 erc20 token，不可升级
3.hero 合约，部署后任何拥有（管理员注册过的 nft 合约）NFT 的人，都可以创建 hero 记录，包括保存 hero。加载 hero 不需要拥有 NFT。

让我们总结一下测试结果：
HeroMetadataTest 测试套件（6 个测试全部通过）：
testSetAndGetSkill: 成功测试技能的设置和获取（gas: 77292）
testSetAndGetRace: 成功测试种族的设置和获取（gas: 110591）
testSetAndGetClass: 成功测试职业的设置和获取（gas: 148303）
testFailUnauthorizedSetSkill: 成功测试未授权设置技能的失败情况（gas: 16444）
testFailUnauthorizedSetRace: 成功测试未授权设置种族的失败情况（gas: 16758）
testFailUnauthorizedSetClass: 成功测试未授权设置职业的失败情况（gas: 17397）
HeroTest 测试套件（4 个测试全部通过）：
testCreateHero: 成功测试创建英雄（gas: 146020）
testLoadHero: 成功测试加载英雄数据（gas: 140116）
testSaveHero: 成功测试保存英雄数据（gas: 172793）
testFailSaveHeroInvalidNodeSignature: 成功测试无效节点签名的失败情况（gas: 154267）
HeroNFTTest 测试套件（6 个测试全部通过）：
testMint: 成功测试铸造功能（gas: 72061）
testMintBatch: 成功测试批量铸造（gas: 134614）
testBurn: 成功测试销毁功能（gas: 57752）
testFailBurnUnauthorized: 成功测试未授权销毁的失败情况（gas: 74123）
testFailMintUnauthorized: 成功测试未授权铸造的失败情况（gas: 17964）
testIsApprovedForToken: 成功测试授权检查（gas: 99808）
CounterTest 测试套件（2 个测试全部通过）：
testFuzz_SetNumber: 成功测试模糊测试设置数字（256 次运行）
test_Increment: 成功测试递增功能（gas: 31303）
所有合约的功能都按预期工作，包括：
权限控制正常工作
数据存储和检索功能正确
业务逻辑验证正确
Gas 消耗在合理范围内
接下来，我们可以继续进行部署脚本的编写和优化工作。你想先关注哪个方面？

## 合约业务逻辑分析

### 1. 合约架构概述

整个英雄系统由三个主要合约组成：
- HeroNFT：负责英雄 NFT 的铸造和管理
- HeroMetadata：负责英雄元数据（技能、种族、职业）的管理
- Hero：核心合约，负责英雄数据的创建、加载和保存

所有合约都采用可升级代理模式实现，使用 OpenZeppelin 的 UUPS 模式。

### 2. HeroNFT 合约

#### 核心功能：
1. NFT 基础功能
   - `mint(address to, uint256 tokenId)`: 铸造单个英雄 NFT
   - `mintBatch(address to, uint256[] tokenIds)`: 批量铸造英雄 NFT
   - `burn(uint256 tokenId)`: 销毁英雄 NFT
   - `exists(uint256 tokenId)`: 检查 NFT 是否存在
   - `isApprovedForToken(address operator, uint256 tokenId)`: 检查授权状态

#### 权限控制：
- 只有合约所有者可以铸造 NFT
- NFT 持有者可以销毁自己的 NFT
- 支持标准的 ERC721 授权机制

### 3. HeroMetadata 合约

#### 数据结构：
1. 技能系统
   ```solidity
   struct Skill {
       string name;        // 技能名称
       uint8 level;       // 技能等级
       uint16 points;     // 所需技能点
       Season season;     // 所属季节
       bool isActive;     // 是否激活
   }
   ```

2. 种族属性
   ```solidity
   struct RaceAttributes {
       uint16[4] baseAttributes;  // 基础属性值 [敏捷，攻击，生命，防御]
       string description;        // 种族描述
       bool isActive;            // 是否激活
   }
   ```

3. 职业属性
   ```solidity
   struct ClassAttributes {
       uint16[4] baseAttributes;  // 基础属性值
       uint16[4] growthRates;     // 属性成长率
       string description;        // 职业描述
       bool isActive;            // 是否激活
   }
   ```

#### 核心功能：
1. 技能管理
   - `setSkill(uint8 seasonId, uint8 skillId, uint8 level, string name, uint16 points, bool isActive)`
   - `getSkill(uint8 seasonId, uint8 skillId, uint8 level)`

2. 种族管理
   - `setRace(uint8 raceId, uint16[4] baseAttributes, string description, bool isActive)`
   - `getRace(uint8 raceId)`

3. 职业管理
   - `setClass(uint8 classId, uint16[4] baseAttributes, uint16[4] growthRates, string description, bool isActive)`
   - `getClass(uint8 classId)`

### 4. Hero 核心合约

#### 数据结构：
```solidity
struct HeroData {
    uint256 id;           // 英雄ID
    uint8 level;         // 等级
    uint32 exp;          // 经验值
    uint32 createTime;   // 创建时间
    uint32 lastSaveTime; // 最后保存时间
    bytes signature;     // 最后一次保存的签名
}
```

#### 核心功能：
1. 英雄管理
   - `createHero(uint256 userId, string name, uint8 race, uint8 class)`: 创建新英雄
   - `loadHero(uint256 heroId)`: 加载英雄数据
   - `saveHero(uint256 heroId, HeroData data, bytes nodeSignature, bytes clientSignature)`: 保存英雄数据

2. 签名验证
   - `verifyNodeSignature(uint256 heroId, HeroData data, bytes signature)`: 验证节点签名
   - `verifyClientSignature(uint256 heroId, HeroData data, bytes signature)`: 验证客户端签名

3. 节点管理
   - `registerNode(address node)`: 注册验证节点
   - `unregisterNode(address node)`: 注销验证节点

#### 安全机制：
1. 双重签名验证
   - 需要节点签名验证
   - 需要客户端（用户）签名验证
2. 权限控制
   - 只有 NFT 持有者可以加载和保存英雄数据
   - 只有合约所有者可以注册/注销节点
3. 数据验证
   - 等级上限检查
   - 经验值上限检查
   - 时间戳验证

### 5. 代理合约架构

1. ProxyAdmin
   - 管理所有可升级合约的代理
   - 控制合约升级权限

2. HeroProxy
   - 使用 ERC1967 代理标准
   - 支持合约初始化
   - 实现合约可升级性

### 6. 关键业务流程

1. 英雄创建流程：
   ```
   1. 调用 Hero.createHero()
   2. 生成唯一的英雄 ID
   3. 创建英雄基础数据
   4. 铸造对应的 NFT
   5. 触发 HeroCreated 事件
   ```

2. 英雄数据保存流程：
   ```
   1. 节点验证并签名数据
   2. 客户端签名数据
   3. 调用 Hero.saveHero()
   4. 验证双重签名
   5. 更新英雄数据
   6. 触发 HeroSaved 事件
   ```

### 7. Gas 优化策略

1. 数据压缩
   - 使用 uint8/uint32 等较小的数据类型
   - 将多个小数据打包存储

2. 存储优化
   - 使用 mapping 进行数据存储
   - 合理组织数据结构减少存储槽使用

3. 批量操作
   - 支持批量 NFT 铸造
   - 数据更新批处理

### 8. 未来扩展性

1. 预留接口
   - 跨链消息传递接口
   - 元数据扩展接口

2. 升级机制
   - 所有合约支持 UUPS 升级模式
   - 可以通过升级添加新功能

3. 可扩展性设计
   - 模块化的合约架构
   - 清晰的接口定义
   - 可插拔的组件设计