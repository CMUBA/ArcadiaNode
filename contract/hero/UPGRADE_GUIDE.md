# 合约升级指南

本指南详细说明了如何升级 Hero、Arcadia 和 Move 合约。

## 准备工作

1. 确保环境变量正确设置：
```shell
# 部署者私钥
PRIVATE_KEY=your_private_key

# ProxyAdmin 合约地址
PROXY_ADMIN=proxy_admin_address

# 各个合约的代理地址
HERO_PROXY=hero_proxy_address
ARCADIA_PROXY=arcadia_proxy_address
MOVE_PROXY=move_proxy_address

# 各个合约的实现地址
HERO_IMPLEMENTATION=hero_implementation_address
ARCADIA_IMPLEMENTATION=arcadia_implementation_address
MOVE_IMPLEMENTATION=move_implementation_address
```

2. 确保你有足够的测试网 ETH 进行部署

## 升级步骤

### 1. 创建新版本合约

为要升级的合约创建新版本（V2），需要：

1. 继承 OpenZeppelin 的可升级合约
2. 使用 `reinitializer(2)` 而不是 `initializer`
3. 将 `VERSION` 设置为存储变量而不是常量
4. 在 `initialize` 函数中设置版本号

示例：
```solidity
contract ContractV2 is Initializable, OwnableUpgradeable {
    string public VERSION;

    function initialize() public reinitializer(2) {
        __Ownable_init();
        VERSION = "2.0.0";
    }
}
```

### 2. 检查当前状态

使用 `CheckState.s.sol` 脚本检查当前合约状态：

```bash
source .env && forge script script/CheckState.s.sol:CheckStateScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL -vvvv
[⠒] Compiling...
No files changed, compilation skipped
Traces:
  [46844] CheckStateScript::run()
    ├─ [0] VM::envAddress("VITE_PROXY_ADMIN") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::envAddress("VITE_HERO_PROXY") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::envAddress("VITE_HERO_IMPLEMENTATION") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::envBytes32("HERO_PRIVATE_KEY") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::addr(<pk>) [staticcall]
    │   └─ ← [Return] 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA
    ├─ [0] console::log("\nAddresses:") [staticcall]
    │   └─ ← [Stop] 
    ├─ [0] console::log("ProxyAdmin:", 0x909A58593C71F2F24d7661E8aBF6eCA064b61F21) [staticcall]
    │   └─ ← [Stop] 
    ├─ [0] console::log("Hero Proxy:", 0xF2f3cfb02557840A1628c50032142A9575BEfCFC) [staticcall]
    │   └─ ← [Stop] 
    ├─ [0] console::log("Hero Implementation:", 0x9fFAC59C6A3D49b0396F6A2F7e8012055838878c) [staticcall]
    │   └─ ← [Stop] 
    ├─ [0] console::log("Deployer:", 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA) [staticcall]
    │   └─ ← [Stop] 
    ├─ [10399] 0xF2f3cfb02557840A1628c50032142A9575BEfCFC::VERSION() [staticcall]
    │   ├─ [3257] 0x9fFAC59C6A3D49b0396F6A2F7e8012055838878c::VERSION() [delegatecall]
    │   │   └─ ← [Return] "2.0.0"
    │   └─ ← [Return] "2.0.0"
    ├─ [0] console::log("\nContract version:", "2.0.0") [staticcall]
    │   └─ ← [Stop] 
    ├─ [3023] 0xF2f3cfb02557840A1628c50032142A9575BEfCFC::owner() [staticcall]
    │   ├─ [2387] 0x9fFAC59C6A3D49b0396F6A2F7e8012055838878c::owner() [delegatecall]
    │   │   └─ ← [Return] 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA
    │   └─ ← [Return] 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA
    ├─ [0] console::log("\nContract owner:", 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA) [staticcall]
    │   └─ ← [Stop] 
    ├─ [0] console::log("Is deployer the owner?", true) [staticcall]
    │   └─ ← [Stop] 
    ├─ [2963] 0xF2f3cfb02557840A1628c50032142A9575BEfCFC::officialNFT() [staticcall]
    │   ├─ [2327] 0x9fFAC59C6A3D49b0396F6A2F7e8012055838878c::officialNFT() [delegatecall]
    │   │   └─ ← [Return] 0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c
    │   └─ ← [Return] 0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c
    ├─ [0] console::log("\nOfficial NFT:", 0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c) [staticcall]
    │   └─ ← [Stop] 
    ├─ [9631] 0xF2f3cfb02557840A1628c50032142A9575BEfCFC::getRegisteredNFTs() [staticcall]
    │   ├─ [8989] 0x9fFAC59C6A3D49b0396F6A2F7e8012055838878c::getRegisteredNFTs() [delegatecall]
    │   │   └─ ← [Return] [0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c]
    │   └─ ← [Return] [0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c]
    ├─ [0] console::log("\nRegistered NFTs:") [staticcall]
    │   └─ ← [Stop] 
    ├─ [0] console::log(0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c) [staticcall]
    │   └─ ← [Stop] 
    └─ ← [Stop] 


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
  
Official NFT: 0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c
  
Registered NFTs:
  0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c
```

### 3. 选择升级方式

有两种升级方式：

#### 方式一：升级现有代理合约

使用 `UpgradeContract.s.sol` 脚本升级现有代理合约：

```bash
source .env && forge script script/UpgradeContract.s.sol:UpgradeContractScript --rpc-url $RPC_URL --broadcast -vvvv
```

适用场景：
- 代理合约工作正常
- 只需要更新实现合约
- 需要保持现有状态

#### 方式二：部署新的代理合约

使用 `DeployNewProxy.s.sol` 脚本部署新的代理合约：

```bash
source .env && forge script script/DeployNewProxy.s.sol:DeployNewProxyScript --rpc-url $RPC_URL --broadcast -vvvv
```

适用场景：
- 代理合约有问题
- 不需要保持现有状态
- 想要完全重新开始

### 4. 验证升级

1. 更新环境变量中的合约地址
2. 使用 `CheckState.s.sol` 脚本验证新状态
3. 测试所有主要功能

### 5. 数据迁移

如果选择方式二（新代理合约），且需要迁移数据：

1. 创建专门的数据迁移脚本
2. 从旧合约读取数据
3. 写入新合约
4. 验证数据完整性

## 注意事项

1. 始终在测试网进行充分测试
2. 保持良好的版本控制和文档记录
3. 确保新合约与旧合约的存储布局兼容
4. 在升级前备份所有重要数据
5. 使用多重签名钱包管理重要合约的升级权限

## 常见问题

### Q: 升级失败，显示 "revert" 错误
A: 检查：
- 是否有正确的权限
- 初始化函数是否正确配置
- 存储布局是否兼容

### Q: 升级后状态丢失
A: 检查：
- 是否使用了正确的代理合约地址
- 存储变量的名称和类型是否完全匹配
- 是否正确调用了初始化函数

### Q: 无法调用新函数
A: 确认：
- ABI 是否更新
- 代理合约是否指向新的实现
- 函数可见性是否正确

## 模板使用说明

1. 复制相应的模板脚本
2. 替换 `ContractV2` 为实际的合约名
3. 修改环境变量名称
4. 根据需要修改初始化参数和状态检查
5. 运行脚本前仔细检查所有参数
