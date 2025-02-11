# Features
这个文档描述了 Arcadia Node 的主要功能features。
如[Introduction](./INTRODUCTION.md)文档所述，Arcadia Node 是一个基于区块链的分布式服务节点系统，提供基础服务和扩展服务的注册、发现和管理功能。
如[MODULE_LOGICS](./MODULE_LOGICS.md)文档所述，Arcadia Node 的主要模块逻辑.
本文档会拆分不同的service，每个service对应一个feature。

## Service Flow

### Node Registration and Verification

```mermaid
sequenceDiagram
    participant NewNode as 新节点
    participant API as 注册服务节点
    participant Contract as 链上合约

    NewNode->>API: 1. GET /api/v1/node/get-challenge
    API->>API: 2. 生成挑战字符串
    API-->>NewNode: 3. 返回挑战字符串

    NewNode->>NewNode: 4. 使用私钥签名挑战
    NewNode->>API: 5. POST /api/v1/node/sign
    API->>API: 6. 验证签名
    API-->>NewNode: 7. 返回 JWT token

    NewNode->>API: 8. POST /api/v1/node/register (带 JWT)
    API->>Contract: 9. registerNode(nodeAddress, ipOrDomain, apiIndexes, challenge, signature)
    Contract->>Contract: 10. 验证签名和质押数量
    Contract-->>API: 11. 注册结果
    API-->>NewNode: 12. 返回注册结果
```

### User Register Flow 

```mermaid
sequenceDiagram
    participant User as 用户
    participant Client as 客户端
    participant Node as 社区节点
    participant TEE as TEE环境
    participant Contract as AirAccount合约

    User->>Client: 1. 访问注册页面
    User->>Client: 2. 选择认证方式(Google/Twitter/Email)
    Client->>Node: 3. 发起认证请求
    Node-->>User: 4. 重定向到认证服务
    User->>Node: 5. 完成认证并返回
    Node->>Node: 6. 验证认证信息
    
    Node->>TEE: 7. 请求生成密钥对
    User->>Client: 8. 提供指纹
    Client->>TEE: 9. 发送指纹信息
    TEE->>TEE: 10. 基于认证信息和指纹生成密钥对
    TEE-->>Node: 11. 返回公钥
    
    Node->>Contract: 12. 注册AirAccount
    Contract-->>Node: 13. 注册结果
    Node-->>Client: 14. 返回注册结果
    Client-->>User: 15. 显示注册成功
```

### GameX: Create, Save and Load

```mermaid
sequenceDiagram
    participant User as 用户
    participant Client as 客户端
    participant Node as 社区节点
    participant Contract as 链上合约

    Note over User,Contract: Hero NFT 购买流程
    User->>Client: 1. 请求购买 HeroNFT
    Client->>Node: 2. 发起购买请求
    Node->>Contract: 3. 调用 HeroNFT 合约铸造
    Contract-->>Node: 4. 返回铸造结果
    Node-->>Client: 5. 返回购买结果
    Client-->>User: 6. 显示购买成功

    Note over User,Contract: Hero 创建流程
    User->>Client: 7. 请求创建 Hero
    Client->>Node: 8. 发送创建请求
    Node->>Contract: 9. 验证 NFT 所有权
    Contract-->>Node: 10. 验证结果
    Node->>Contract: 11. 调用 Hero 合约创建英雄
    Contract->>Contract: 12. 读取 HeroMetadata
    Contract-->>Node: 13. 返回创建结果
    Node-->>Client: 14. 返回 Hero 数据
    Client-->>User: 15. 显示创建成功

    Note over User,Contract: Hero 数据保存/加载
    User->>Client: 16. 游戏过程中保存数据
    Client->>Node: 17. 发送保存请求
    Node->>Contract: 18. 调用 Hero 合约保存数据
    Contract-->>Node: 19. 返回保存结果
    Node-->>Client: 20. 确认保存成功
    Client-->>User: 21. 显示保存成功
```

## Detail Features
我们定义features是客户感知到的有价值的能力特征。
那我们的产品客户群包括：
1. 投资者（需要知道你的killer feature是啥）
2. 社区节点运营者（希望提供计算服务获得稳定收入）
3. 产品用户（希望不同产品获得不同的能力特征赋能）

我们的产品如前所示：
1. COS72:整合我们基础能力和扩展能力的系统，社区收入系统和无数个插件模块，适合社区使用。
2. AirAccount/SuperPaymaster：为普通用户提供简单的payandgo的加密无gas体验。
3. ZuCoffee：帮助全球商业体验Web3商业便利的IT系统，包括链上Shop和移动支付。
4. Arcaida：一个开放的游戏世界，支持众创，嵌入了Arcadia Business。
5. ArcaidaNode：社区节点体系，你可以不使用Cos72,但是提供Cos72的计算服务。
6. 更多的产品，已插件形式嵌入在COS72中。

### Client端核心feature
http://localhost:3008/pages/hero-test.html
1. 配合合约，用户可以创建Hero，加载Hero数据，保存Hero数据。
2. 未来此页面逻辑会嵌入到server端，成为API，而部分交互逻辑会提炼成为客户端交互的模板。
3. 

### GameX: Create, Save and Load
1. 基础参数：chainId, userOperations(long signature include tx and fingerprint), nodeSignature
2. 

