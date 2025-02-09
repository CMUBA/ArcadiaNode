## Hero contract

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

   创建流程：购买 NFT -> 创建 Hero -> 初始化属性
   保存流程：验证所有权 -> 验证签名 -> 保存数据
   加载流程：验证所有权 -> 返回数据

   价格机制：
Solidity：支持原生 ETH 和任意 ERC20 token
Aptos：支持原生 APT 和任意 Coin 类型
两个链都支持：
默认价格配置
每个 NFT 的自定义价格配置
动态价格更新

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


## Interfaces

### HeroNFT合约接口
- mint(address to, uint256 tokenId): 铸造新的英雄NFT
- mintBatch(address to, uint256[] tokenIds): 批量铸造英雄NFT
- burn(uint256 tokenId): 销毁英雄NFT
- exists(uint256 tokenId): 检查NFT是否存在
- setPriceConfig(uint256 tokenId, address tokenAddress, uint256 price): 设置NFT价格配置
- getPriceConfig(uint256 tokenId): 获取NFT价格配置
- setDefaultPrices(uint256 nativePrice, uint256 tokenPrice): 设置默认价格
- setDefaultPaymentToken(address token): 设置默认支付代币
- getDefaultPaymentToken(): 获取默认支付代币
- getDefaultTokenPrice(): 获取默认代币价格
- getDefaultNativePrice(): 获取默认原生代币价格
- mintWithToken(address to, uint256 tokenId, address paymentToken): 使用代币铸造NFT

### Hero合约接口
- createHero(uint256 userId, string name, uint8 race, uint8 class): 创建新英雄
- loadHero(uint256 heroId): 加载英雄数据
- saveHero(uint256 heroId, HeroData data, bytes nodeSignature, bytes clientSignature): 保存英雄数据
- verifyNodeSignature(uint256 heroId, HeroData data, bytes signature): 验证节点签名
- verifyClientSignature(uint256 heroId, HeroData data, bytes signature): 验证客户端签名
- addRegisteredNFT(address nftContract): 添加注册的NFT合约
- removeRegisteredNFT(address nftContract): 移除注册的NFT合约
- getRegisteredNFTs(): 获取所有注册的NFT合约列表
- isRegisteredNFT(address nftContract): 检查NFT合约是否已注册
- getHeroCount(): 获取总英雄数量
- getHerosByOwner(address owner): 获取指定地址拥有的所有英雄
- getHeroStats(uint256 heroId): 获取英雄详细状态

### HeroMetadata合约接口
- setSkillTable(uint256[] skillIds, string[] names): 设置技能表
- setRaceTable(uint256[] raceIds, string[] names): 设置种族表
- setClassTable(uint256[] classIds, string[] names): 设置职业表
- getSkillName(uint256 skillId): 获取技能名称
- getRaceName(uint256 raceId): 获取种族名称
- getClassName(uint256 classId): 获取职业名称


### Active 业务意义

struct PriceConfig {
    address tokenAddress;  // 支付代币地址
    uint256 price;        // 价格
    bool isActive;        // 是否激活
}


控制NFT的可铸造状态：只有当价格配置为active时，用户才能使用该支付方式铸造NFT
允许合约所有者临时暂停某种支付方式，而不需要删除价格配置
方便管理多种支付方式，可以随时启用或禁用特定的支付代币
这种设计允许：

灵活管理支付方式：可以预先设置多种支付方式，但只激活部分
快速响应市场变化：可以随时启用或禁用某种支付方式，而不需要重新设置价格
紧急情况处理：如果发现某种支付代币有问题，可以立即通过设置isActive为false来暂停该支付方式

Hero合约: 7个测试用例全部通过
HeroNFT合约: 11个测试用例全部通过
HeroMetadata合约: 6个测试用例全部通过



### Contract deployment

#### Previous Contract Addresses
```
# HeroNFT Contract
VITE_HERO_NFT_PROXY=0x5915c1D71bDfA5276A98FC9FE9074370721807c2
VITE_HERO_NFT_IMPLEMENTATION=0xe888CA2F4D287f15EFC494284a595d5Ee34365F1
VITE_PROXY_ADMIN=0x1F70eB943a54Fc3A0Ff5ef43330aB9498E6e0d53

# HeroMetadata Contract
VITE_HERO_METADATA_PROXY=0xb6A58680db8ffA71B8eb219e11A8B1d267D01095
VITE_HERO_METADATA_IMPLEMENTATION=0xCd1ceF34cbc358c3338A5eEa3392D0f46D3f3232
VITE_HERO_METADATA_PROXY_ADMIN=0xCd1ceF34cbc358c3338A5eEa3392D0f46D3f3232

# Hero Contract
VITE_HERO_PROXY=0x5aEe59c7D6434eC6f83066C388E6fe76959F9ec1
VITE_HERO_IMPLEMENTATION=0xD7d3d98adD4aA07bfaa88fFcD37AC16A53750ba9
VITE_HERO_PROXY_ADMIN=0xb3aF613b042259A3cC9c20AE2eF616Ab385c8d7c
```

#### New Contract Addresses
```
# HeroNFT Contract
VITE_HERO_NFT_PROXY=0xfe23Cd9cb879F3fa4381F6bE8370536634be7C07
VITE_HERO_NFT_IMPLEMENTATION=0x9276D15f659bbA3CD56aD838D122128621eB5C22
VITE_PROXY_ADMIN=0x9C56A308C979A6d64Ad2A0fd9531F64ff53a12a3

# HeroMetadata Contract
VITE_HERO_METADATA_PROXY=0xfB263E3FAE1492D7BAAc2a7A473e3B135E51b885
VITE_HERO_METADATA_IMPLEMENTATION=0x3720B69B7f30D92FACed624c39B1fd317408774B
VITE_HERO_METADATA_PROXY_ADMIN=0x50824505FeB1460A9697c634df3580510cc44B22

# Hero Contract
VITE_HERO_PROXY=0xCe9895e8df0F4B7f5Df0DD1eecb3ebF1Da3022Ae
VITE_HERO_IMPLEMENTATION=0x1b6e93F0933c012eA074C4F040ca7639d67f4235
VITE_HERO_PROXY_ADMIN=0x1229Bd503B7899aC69218F5E1df7829fAe6aD294
```

总结一下部署结果：

HeroNFT合约：
代理合约：0xfe23Cd9cb879F3fa4381F6bE8370536634be7C07
实现合约：0x9276D15f659bbA3CD56aD838D122128621eB5C22
代理管理合约：0x9C56A308C979A6d64Ad2A0fd9531F64ff53a12a3
HeroMetadata合约：
代理合约：0xfB263E3FAE1492D7BAAc2a7A473e3B135E51b885
实现合约：0x3720B69B7f30D92FACed624c39B1fd317408774B
代理管理合约：0x50824505FeB1460A9697c634df3580510cc44B22
Hero合约：
代理合约：0xF67C64d55ba1Ff11f02a1e0336bb80d23212ceA2
实现合约：0x20b0AA970c49a0E15ed580e7d07E200E3a60888C
代理管理合约：0x67dDB6e30314286E0a9B7b5831b1a8F0b780278a
所有合约都已经在Optimism Sepolia测试网上成功部署和验证

### 2024-02-09 合约优化
1. 简化接口设计
   - 合并 `setNFTContract` 和 `addRegisteredNFT` 为单个 `registerNFT` 函数
   - 使用 `isOfficial` 参数统一处理官方和社区NFT注册

2. 增强安全性
   - 添加地址有效性检查
   - 防止NFT重复注册
   - 保护官方NFT不被取消注册

3. 提升可维护性
   - 添加事件日志：`NFTRegistered`, `NFTUnregistered`
   - 完善函数注释
   - 优化状态变量组织

4. 增加查询功能
   - `isNFTRegistered`: 检查NFT注册状态
   - `getRegisteredNFTs`: 获取所有注册的NFT
   - `getOfficialNFT`: 获取官方NFT
   - `getRegisteredNFTCount`: 获取注册数量

5. 保持可升级性
   - 继承 `Initializable` 和 `OwnableUpgradeable`
   - 使用初始化函数替代构造函数



== Logs ==
  
Addresses:
  ProxyAdmin: 0x909A58593C71F2F24d7661E8aBF6eCA064b61F21
  Hero Proxy: 0xb86236BA8D6CAb15cf7972871f246F7C8693338b
  Hero Implementation: 0x888C56Fce47919D84CB33b7DcE322839C4Fa2173
  Deployer: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA
  
Failed to get version
  
Contract owner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA
  Is deployer the owner? true
  
Official NFT: 0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c
  
Registered NFTs:
  0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c

  VITE_HERO_PROXY=0xb86236BA8D6CAb15cf7972871f246F7C8693338b
VITE_HERO_IMPLEMENTATION=0x888C56Fce47919D84CB33b7DcE322839C4Fa2173


Script ran successfully.

== Logs ==
  
Addresses:
  ProxyAdmin: 0x909A58593C71F2F24d7661E8aBF6eCA064b61F21
  Hero Proxy: 0xF2f3cfb02557840A1628c50032142A9575BEfCFC
  Hero Implementation: 0x9fFAC59C6A3D49b0396F6A2F7e8012055838878c
  Deployer: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA
  
Contract version: 2.0.0
  
Contract owner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA
  Is deployer the owner? true
  
Official NFT: 0x0000000000000000000000000000000000000000
  
Registered NFTs:

Chain 11155420

Estimated gas price: 0.001000502 gwei

Estimated total gas used for script: 178122

Estimated amount required: 0.000000178211417244 ETH

==========================


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/broadcast/RegisterOldNFT.s.sol/11155420/run-latest.json

Sensitive values saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/cache/RegisterOldNFT.s.sol/11155420/run-latest.json


太好了！我们已经成功地：

部署了新的 HeroV2 合约，它使用 reinitializer(2) 来允许重新初始化
部署了新的代理合约，指向新的实现合约
注册了旧的官方 NFT
现在我们可以继续使用这个新的合约了。关于初始化的改进：

在 HeroV2 中，我们使用了 reinitializer(2) 而不是 initializer，这允许我们在升级时重新初始化合约
我们将 VERSION 从常量改为存储变量，这样它可以在代理合约中正确工作
我们在初始化函数中设置了版本号
这些改进使得合约更容易升级和维护。您可以继续使用这个新的合约了。如果您需要进行任何其他操作，请告诉我。

Me

1.请整理下，指导我后续如何升级三个主合约的步骤和调用脚本

好的，我来整理一下如何升级三个主合约的步骤和脚本。

1. 升级步骤概述
对于每个合约（Hero、Arcadia、Move），升级流程基本相同：

创建新版本的合约（V2）
部署新的实现合约
升级代理合约指向新的实现
初始化新合约
迁移旧数据（如果需要）
2. 合约升级脚本模板
让我创建一个通用的升级脚本模板：

Created
UpgradeContract.s.sol
+57
-0
 0
Open diff
Created
DeployNewProxy.s.sol
+54
-0
 0
Open diff
让我继续完成升级指南：

Created
CheckState.s.sol
+65
-0
 0
Open diff
Created
UPGRADE_GUIDE.md
+139
-0
 0
Open diff
我已经创建了一套完整的升级指南和模板：

模板脚本（在 script/template/ 目录下）：
UpgradeContract.s.sol：升级现有代理合约
DeployNewProxy.s.sol：部署新的代理合约
CheckState.s.sol：检查合约状态
升级指南（UPGRADE_GUIDE.md）：
详细的准备工作
两种升级方式的说明
步骤和注意事项
常见问题解答
模板使用说明
使用这些模板和指南，您可以：

根据需要选择升级方式
复制并修改相应的模板脚本
按照指南中的步骤执行升级
使用检查脚本验证升级结果


# 部署和初始化流程

## 1. 环境准备
1. 确保 .env 文件配置正确：
   - HERO_PRIVATE_KEY: 部署账户私钥
   - OPTIMISM_SEPOLIA_RPC_URL: RPC URL
   - VITE_HERO_PROXY: Hero合约代理地址
   - VITE_HERO_NFT_PROXY: HeroNFT合约代理地址

## 2. 合约部署
按照以下顺序执行部署脚本：

1. 部署 HeroNFT 合约：
```bash
source .env && forge script script/DeployHeroNFT.s.sol:DeployHeroNFTScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL --broadcast -vvvv


2 hero
source .env && forge script script/DeployHero.s.sol:DeployHeroScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL --broadcast -vvvv

3. meta init
source .env && forge script script/InitMetadata.s.sol:InitMetadataScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL --broadcast -vvvv

4. init nft
source .env && forge script script/InitMintNFT.s.sol:InitMintNFTScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL --broadcast -vvvv

5. test run
source .env && forge script script/TestHeroContract.s.sol:TestHeroContractScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL --broadcast -vvvv

6.reg hero
source .env && forge script script/RegisterDeployerHero.s.sol:RegisterDeployerHeroScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL --broadcast -vvvv


source .env && forge script script/UpgradeToV3.s.sol:UpgradeToV3Script --rpc-url $OPTIMISM_SEPOLIA_RPC_URL --broadcast -vvvv

source .env && forge script script/RegisterHeroRecord.s.sol:RegisterHeroRecordScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL --broadcast -vvvv

source .env && forge script script/RegisterNFTInV3.s.sol:RegisterNFTInV3Script --rpc-url $OPTIMISM_SEPOLIA_RPC_URL --broadcast -vvvv

source .env && forge script script/RegisterHeroRecord.s.sol:RegisterHeroRecordScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL --broadcast -vvvv


创建了 HeroV3 合约，添加了完整的英雄记录功能：
基本信息：名称、描述
属性系统：力量、敏捷、智力、体力、幸运
等级系统：等级、经验值
技能系统：剑术精通、盾牌防御、战斗战术
升级了合约并成功初始化
注册了 NFT 合约
为 NFT ID 10001 创建了英雄记录：
Hero Record:
Name: Arcadian Warrior
Description: A legendary warrior from the realm of Arcadia

Attributes:
Strength: 100
Agility: 80
Intelligence: 90
Vitality: 85
Luck: 70

Skills:
Sword Mastery Level: 1
Shield Defense Level: 1
Battle Tactics Level: 1

Level Info:
Level: 1
Experience: 0

部署了所有合约：
ProxyAdmin
HeroNFT 实现和代理
Hero 实现和代理
HeroMetadata 实现和代理
初始化了基础数据：
设置了初始技能
注册了 NFT 合约
成功铸造了第一个 NFT
输出了所有合约地址，格式化为 .env 格式

测试脚本执行结果分析：

初始状态检查正常：
Hero Proxy 和 NFT Proxy 地址正确
Owner 地址正确
Official NFT 地址正确
已注册 NFT 数量为 1
测试注册 Official NFT：
失败，原因是 NFT 已经注册（这是预期的，因为我们在部署时已经注册过）
测试注册社区 NFT：
成功注册了一个新的社区 NFT
验证注册状态为 true
总注册 NFT 数量增加到 2
最终状态正确：
可以看到两个注册的 NFT 地址
包括官方 NFT 和新注册的社区 NFT
总结：所有功能都按预期工作，包括：

合约部署和初始化成功
NFT 注册功能正常
权限控制正常
状态查询功能正常


完成了以下工作：

创建了新的 HeroV4 合约，完全按照原始设计实现：
四季技能系统 (Spring, Summer, Autumn, Winter)，每个季节 5 个技能
种族系统 (Human, Elf, Dwarf, Orc, Undead)
装备系统 (Weapon, Armor, Accessory)
能量和积分系统 (每日能量上限 100，积分上限 1000)
创建了查询脚本 QueryHeroV4.s.sol，展示所有可读数据：
合约基本信息（版本、官方 NFT）
已注册的 NFT 列表
英雄基本信息（名称、种族、性别、等级、能量、积分）
四季技能等级
装备信息
系统常量
NFT 合约已经实现了所有必要的功能：
支持原生代币和 ERC20 代币支付
支持单个和批量铸造
支持自定义价格配置
支持查询接受的支付代币
关于 NFT 合约的 getAcceptedTokens 接口：
当前可以通过 getDefaultPaymentToken() 获取默认支付代币
对于特定 tokenId，可以通过 getPriceConfig(tokenId) 获取其接受的支付代币
我们可以添加一个新的辅助函数来获取所有接受的代币：


关于 InitRegisterNFT.s.sol 和代理合约的问题：
使用代理合约是因为我们采用了可升级合约模式。所有的状态都存储在代理合约中，而不是实现合约中。
当我们调用 IHero(heroProxy) 时，调用会被代理合约转发到实现合约，但状态会保存在代理合约中。
如果直接调用实现合约，状态会保存在错误的地方，而且会导致合约状态不一致。


ProxyAdmin 合约：负责管理代理合约的升级权限，通常不需要更改
三个代理合约（Hero、NFT、Metadata）：是状态的存储位置，通常也不需要更改
实现合约：是可以更改的部分，当需要升级功能时，只需要部署新的实现合约并通过代理指向它

升级过程中的注意事项：

新的实现合约必须保持存储布局兼容性
如果需要初始化新的存储变量，需要在升级脚本中调用初始化函数
确保升级不会影响现有的合约状态和数据

升级合约：
source .env && forge script script/UpgradeHero.s.sol:UpgradeHeroScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL --broadcast -vvvv



#### deploy 9th Feb afternoon
  ProxyAdmin deployed to: 0x338D4A093ABF7eD0C1D8FeD759e96429D158e2c5
  HeroNFT Implementation deployed to: 0xEd05eb3ABe4EDAc6B676a5eA1547cF7f6E32f695
  HeroNFT Proxy deployed to: 0x078C6C1c996FB8e4C15B13D23904C7D7bAa47724



  ProxyAdmin deployed to: 0xCD34e5a0870671BB5DCE61BabA575e373144a12f
  Hero Implementation deployed to: 0x997e839Dc05EfA96519eCF28457ed0534462360F
  Hero Proxy deployed to: 0xbdbA2372103EE713D96532347830ECA4f2450ed3


  ProxyAdmin deployed to: 0x277a45761f749743E3c2b7220561c7f3e87D0824
  HeroMetadata Implementation deployed to: 0x478b25E797ffee89602A0832085c60aa1E277488
  HeroMetadata Proxy deployed to: 0x51E84E5C51E83DCcbbe3244e57088B5876AAE4c9


脚本来检查所有合约的所有权状态：
source .env && forge script script/CheckOwnership.s.sol:CheckOwnershipScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL -vvvv


CheckDeployer 脚本来验证部署账户
source .env && forge script script/CheckDeployer.s.sol:CheckDeployerScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL -vvvv

查看proxy
source .env && forge script script/CheckProxy.s.sol:CheckProxyScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL -vvvv

权限
source .env && forge script script/CheckPermissions.s.sol:CheckPermissionsScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL -vvvv

state
source .env && forge script script/CheckState.s.sol:CheckStateScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL -vvvv


部署了新的 HeroV2 合约，它使用 reinitializer(2) 来允许重新初始化
部署了新的代理合约，指向新的实现合约
注册了旧的官方 NFT
现在我们可以继续使用这个新的合约了。关于初始化的改进：

在 HeroV2 中，我们使用了 reinitializer(2) 而不是 initializer，这允许我们在升级时重新初始化合约
我们将 VERSION 从常量改为存储变量，这样它可以在代理合约中正确工作
我们在初始化函数中设置了版本号
这些改进使得合约更容易升级和维护。您可以继续使用这个新的合约了。如果您需要进行任何其他操作，请告诉我。


由于使用了代理合约架构：
合约逻辑更新时，只需要部署新的实现合约
不需要重新部署代理合约
所有状态都保存在代理合约中
初始化顺序很重要：
必须先完成 Metadata 初始化
再进行 NFT 的铸造
最后进行合约测试

## Winsurf

1.请列出核心合约的主要接口介绍：名称和功能，类似这样“getDefaultNativePrice: 获取默认原生代币价格”，请追加到readme末尾，以 ## Interfaces 开头

2.请确认nft合约具备了新增一个接受的代币类别合约的接口，包括设置和修改价格
3.请确认hero合约具备了新增一个接受的nft合约注册hero的接口
4.从代码角度解释激活（active）在hero合约的使用和业务意义


1.请编译修改后的合约，运行forge build，确保没有错误
2.请为修改后的合约修改和添加测试脚本，并运行，确保没有错误


1.部署合约是分别按顺序部署：nft, metadata和hero，三个脚本，在script目录下 
2.请按顺序运行部署脚本: forge script ./scripts/deploy-???相关脚本（如果脚本有问题，请修复），产生的新合约地址后，参考env原配置名称，请备份原配置追加在readme，然后替换env那些hero合约相关的变量，新配置也请在readme追加，以 ### Contract deployment 开头

Initiate contracts
1. 请生成一个脚本，在Hero合约中注册HeroNFT合约,作为初始化的第一个NFT合约，接受此nft合约的nft注册为hero
2. 请生成一个脚本，为contract owner（私钥在env） mint一个nft，支付eth到nft合约，作为测试的第一个nft
3. 请生成一个脚本，设置HeroNFT合约的元数据地址，相关数据设置参考readme的数据设定，skill请参考contract目录下的hero-skill.csv来设定meatadata
4. 请生成一个脚本，注册一个hero记录，使用contract owner（私钥在env）作为user，默认nft合约地址请参考env


 查看账户余额
cast balance $VITE_HERO_NFT_PROXY

如果需要，可以发送一些测试网 ETH 到合约地址
cast send --value 1ether $VITE_HERO_NFT_PROXY

source .env && forge script script/TestHeroContract.s.sol:TestHeroContractScript --fork-url $OPTIMISM_SEPOLIA_RPC_URL --broadcast -vvvv

1.如果hero合约修改逻辑，因为我们有proxy代理，是否就不需要全部重新部署，
只需要部署hero合约？还是继续运行部署脚本


1.如果重新部署，请注意清理依赖的ABI缓存，foundry支持直接调用合约函数调试，可以使用这个功能调试
2.请把涉及部署的脚本，调试的脚本，都整理追加到readme，按部署和调试顺序提供说明引导
3.请解释使用代理部署合约的业务价值和意义



此目录完成三个合约的部署和测试
目前nft，metadata和hero合约已经部署（本次测试使用solidity开发的合约，后续会有aptos move合约），地址变量在env中。
配合client端页面要实现：
1.查询hero合约中，允许注册hero记录的nft合约列表，显示在页面上
2.如果当前登录钱包地址，经过检查，没有拥有任何nft合约列表中的nft
3.则点击mint nft页面http://localhost:3008/pages/nft-mint.html，选择某个nft合约，支付eth或者指定的erc20代币（env预设了erc20支付接受的地址），mint nft
4.然后用户可以通过持有接受的nft，来注册hero记录，不需要支付


当前遇到的问题
1.如何从hero nft合约获得getAcceptedTokens，就是nft接受哪些代币支付，需要在nft-mint.html页面中查询和显示，然后点击不同button，发起交易，调用钱包支付，mint nft；需要检查nft合约源代码，如果没有这个接口，需要添加，编译，测试，重新部署，也需要nft新增接受代币合约地址的接口，上述都需要坚持代码，确认是否具备，没有则需要新增

2.如何显示hero合约中，接受nft合约列表的对外接口？，在hero合约初始化部署时，已经把第一次部署的nft合约作为第一个接受的nft合约注册到hero合约；这个nft合约地址在env中已设置。目前发现无法调用getRegisteredNFTs，hero合约没有，需要新增这个函数接口，然后编译，测试，发布，从而让nft-mint页面能够获得这个列表，检查登录用户是否拥有注册的nft合约的nft，有就可注册，没有就引导支付mint后再注册等逻辑（上面的逻辑），上述都需要坚持代码，确认是否具备，没有则需要新增

3.从合约管理的角度，我们通盘看三个核心合约，是否还需要更多的read接口来展示内部数据情况，大部分write的接口都是核心业务逻辑，请检查合约代码后给出建议



# Hero Deployed Contract Addresses
VITE_HERO_NFT_PROXY=0x5915c1D71bDfA5276A98FC9FE9074370721807c2
VITE_HERO_NFT_IMPLEMENTATION=0xe888CA2F4D287f15EFC494284a595d5Ee34365F1
VITE_PROXY_ADMIN=0x1F70eB943a54Fc3A0Ff5ef43330aB9498E6e0d53

VITE_HERO_METADATA_PROXY=0xb6A58680db8ffA71B8eb219e11A8B1d267D01095
VITE_HERO_METADATA_IMPLEMENTATION=0xCd1ceF34cbc358c3338A5eEa3392D0f46D3f3232
VITE_HERO_METADATA_PROXY_ADMIN=0xCd1ceF34cbc358c3338A5eEa3392D0f46D3f3232

VITE_HERO_PROXY=0x5aEe59c7D6434eC6f83066C388E6fe76959F9ec1
VITE_HERO_IMPLEMENTATION=0xD7d3d98adD4aA07bfaa88fFcD37AC16A53750ba9
VITE_HERO_PROXY_ADMIN=0xb3aF613b042259A3cC9c20AE2eF616Ab385c8d7c
