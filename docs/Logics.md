# 业务逻辑汇总

## Client


## Server


## Contract

- `HeroNFT`: 负责英雄 NFT 的铸造和管理，基于 Aptos Token 标准
- `HeroMetadata`: 负责英雄元数据（技能、种族、职业）的管理
- `Hero`: 核心模块，负责英雄数据的创建、加载和保存

### 用户使用逻辑

用户（玩家）需要先购买 HeroNFT，然后才可以创建 hero 记录。
HeroNFT 是所有用户必须先购买的 官方 NFT 合约，属于（collection）合约 的 NFT，才可以在 Hero 合约创建新 hero。
管理员（合约发布者）可以调用 Hero 合约接口，新增许可的 NFT 合约，然后用户就可以使用这些 外部 NFT 在 Hero 合约创建 hero 记录。

HeroMetadata 是静态数据表，存储一些技能计算数据，种族和职业设定等，在部署后需要部署者初始化这个数据，然后以读取为主（也可能会维护）

Hero 是核心英雄数据结构，包括基本属性，技能数据表等，另外会有一个 NFT 合约注册表，只有在此注册表的 NFT，才可以新增 hero 记录，部署者可以给 NFT 注册表新增 NFT 合约（collection）。
