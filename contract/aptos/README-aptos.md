#To fill after you create a collection, will be used for the minting page
VITE_COLLECTION_ADDRESS="0xbce80457b6911b37c73a67f0996f5c000f4f9a9ad6b5bf240d45a5f613e73592"
VITE_MODULE_ADDRESS=0xff8f6b4c41bc8995c354d38465ccf811c4fa9f35b02c58b454f6b0cc841e0abb

3. `npm run dev`

4. access http://localhost:5173/

5. More configuration, check next section

## How to use Aptos Dapp NFT minting dapp Template

Digital Assets are the NFT standard for Aptos. The Digital Asset template provides an end-to-end NFT minting dapp with a beautiful pre-made UI users can quickly adjust and deploy into a live server.

## Read the NFT minting dapp template docs
To get started with the NFT minting dapp template and learn more about the template functionality and usage, head over to the [NFT minting dapp template docs](https://learn.aptoslabs.com/en/dapp-templates/nft-minting-template) 

## The NFT minting dapp template provides 3 pages:

- **Public Mint NFT Page** - A page for the public to mint NFTs.
- **Create Collection Page** - A page for creating new NFT collections. This page is not accessible on production.
- **My Collections Page** - A page to view all the collections created under the current Move module (smart contract). This page is not accessible on production.

## What tools the template uses?

- React framework
- Vite development tool
- shadcn/ui + tailwind for styling
- Aptos TS SDK
- Aptos Wallet Adapter
- Node based Move commands

## What Move commands are available?

The tool utilizes [aptos-cli npm package](https://github.com/aptos-labs/aptos-cli) that lets us run Aptos CLI in a Node environment.

Some commands are built-in the template and can be ran as a npm script, for example:

- `npm run move:publish` - a command to publish the Move contract
- `npm run move:test` - a command to run Move unit tests
- `npm run move:compile` - a command to compile the Move contract
- `npm run move:upgrade` - a command to upgrade the Move contract
- `npm run dev` - a command to run the frontend locally
- `npm run deploy` - a command to deploy the dapp to Vercel

For all other available CLI commands, can run `npx aptos` and see a list of all available commands.

Points address: 0xee3ff47098abfc3640a626732dac235dfdd807b563d806ee8c20460f22d1df85

### Dev practice

1. simple and easy stack: Next.js + Nodit?
2. aptosconnect: email to control their assets, could we develop a session key with user's fingerprint? or any other solution?
3.need a full small game demo on move: NFT, hero and more contract intercation
4. receive and transfer PNTs token


## Aptos Move 合约设计

### 1. 合约架构概述

在 Aptos 链上，我们同样需要实现三个主要模块：
- `HeroNFT`: 负责英雄 NFT 的铸造和管理，基于 Aptos Token 标准
- `HeroMetadata`: 负责英雄元数据（技能、种族、职业）的管理
- `Hero`: 核心模块，负责英雄数据的创建、加载和保存

### 2. HeroNFT 模块设计

```move
module hero_nft {
    use std::string;
    use aptos_token::token;
    use aptos_framework::account;

    struct TokenData has key {
        // NFT 集合信息
        collection: string::String,
        name: string::String,
        description: string::String,
        // NFT 属性
        uri: string::String,
        maximum: u64,
        mutate_setting: vector<bool>,
    }

    struct MintCapability has key {
        mint_events: event::EventHandle<MintEvent>,
    }

    // 核心功能
    public entry fun initialize(account: &signer) {
        // 初始化 NFT 集合
    }

    public entry fun mint(
        account: &signer,
        description: string::String,
        name: string::String,
        uri: string::String,
    ) acquires MintCapability {
        // 铸造单个 NFT
    }

    public entry fun batch_mint(
        account: &signer,
        descriptions: vector<string::String>,
        names: vector<string::String>,
        uris: vector<string::String>,
    ) acquires MintCapability {
        // 批量铸造 NFT
    }

    public entry fun burn(
        account: &signer,
        creator: address,
        collection: string::String,
        name: string::String,
    ) {
        // 销毁 NFT
    }
}
```

### 3. HeroMetadata 模块设计

```move
module hero_metadata {
    use std::string;
    use std::vector;

    // 数据结构
    struct Skill has store, drop {
        name: string::String,
        level: u8,
        points: u16,
        season: u8,
        is_active: bool,
    }

    struct RaceAttributes has store, drop {
        base_attributes: vector<u16>,
        description: string::String,
        is_active: bool,
    }

    struct ClassAttributes has store, drop {
        base_attributes: vector<u16>,
        growth_rates: vector<u16>,
        description: string::String,
        is_active: bool,
    }

    // 资源存储
    struct MetadataStore has key {
        skills: vector<Skill>,
        races: vector<RaceAttributes>,
        classes: vector<ClassAttributes>,
    }

    // 核心功能
    public entry fun initialize(account: &signer) {
        // 初始化元数据存储
    }

    public entry fun set_skill(
        account: &signer,
        season_id: u8,
        skill_id: u8,
        level: u8,
        name: string::String,
        points: u16,
        is_active: bool,
    ) acquires MetadataStore {
        // 设置技能数据
    }

    public entry fun set_race(
        account: &signer,
        race_id: u8,
        base_attributes: vector<u16>,
        description: string::String,
        is_active: bool,
    ) acquires MetadataStore {
        // 设置种族数据
    }

    public entry fun set_class(
        account: &signer,
        class_id: u8,
        base_attributes: vector<u16>,
        growth_rates: vector<u16>,
        description: string::String,
        is_active: bool,
    ) acquires MetadataStore {
        // 设置职业数据
    }
}
```

### 4. Hero 核心模块设计

```move
module hero {
    use std::string;
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::account;

    // 数据结构
    struct HeroData has store, drop {
        id: u256,
        level: u8,
        exp: u32,
        create_time: u64,
        last_save_time: u64,
        signature: vector<u8>,
    }

    struct HeroStore has key {
        heroes: vector<HeroData>,
        registered_nodes: vector<address>,
    }

    // 事件
    struct HeroCreatedEvent has drop, store {
        hero_id: u256,
        owner: address,
        name: string::String,
        race: u8,
        class: u8,
    }

    // 核心功能
    public entry fun create_hero(
        account: &signer,
        name: string::String,
        race: u8,
        class: u8,
    ) acquires HeroStore {
        // 创建英雄
    }

    public fun load_hero(
        hero_id: u256,
    ): HeroData acquires HeroStore {
        // 加载英雄数据
    }

    public entry fun save_hero(
        account: &signer,
        hero_id: u256,
        data: HeroData,
        node_signature: vector<u8>,
        client_signature: vector<u8>,
    ) acquires HeroStore {
        // 保存英雄数据
    }

    // 节点管理
    public entry fun register_node(
        account: &signer,
        node_address: address,
    ) acquires HeroStore {
        // 注册验证节点
    }

    public entry fun unregister_node(
        account: &signer,
        node_address: address,
    ) acquires HeroStore {
        // 注销验证节点
    }
}
```

### 5. Aptos 特有的设计考虑

1. **资源模型**
   - 使用 Aptos 的 Resource Account 管理合约资源
   - 利用 Move 的所有权系统确保资源安全
   - 实现资源的原子性操作

2. **存储优化**
   - 使用 Table 类型优化大规模数据存储
   - 实现惰性加载机制
   - 利用 Move 的向量类型优化批量操作

3. **安全特性**
   - 利用 Move 的类型系统进行静态验证
   - 实现细粒度的访问控制
   - 使用 Capability 模式管理权限

4. **跨链交互**
   - 实现跨链消息验证
   - 支持跨链资产转移
   - 维护跨链状态一致性

### 6. 与以太坊版本的主要区别

1. **数据模型**
   - Move 资源模型 vs Solidity 存储模型
   - 所有权语义的不同处理
   - 事件系统的不同实现

2. **安全机制**
   - Move 的静态类型检查
   - 资源的显式管理
   - Capability 权限模型

3. **性能优化**
   - Move 的并行执行
   - 存储模型优化
   - Gas 计费模型差异

### 7. 部署和升级策略

1. **部署流程**
   ```bash
   # 1. 部署 HeroNFT 模块
   aptos move publish --package-dir hero_nft

   # 2. 部署 HeroMetadata 模块
   aptos move publish --package-dir hero_metadata

   # 3. 部署 Hero 核心模块
   aptos move publish --package-dir hero
   ```

2. **升级机制**
   - 使用 Aptos 的模块升级机制
   - 实现数据迁移策略
   - 维护向后兼容性

3. **测试策略**
   - 单元测试覆盖核心功能
   - Move Prover 形式化验证
   - 集成测试验证跨模块交互

