## How to use

cd contract/optimism
./script/deploy.sh optimism-testnet

cd contract/optimism
./script/deploy.sh optimism-mainnet


### Contract deploy

部署流程分为两步：

1. 部署 StakeManager 合约：
```shell
# 设置环境变量
export PRIVATE_KEY=your_deployer_private_key
export RPC_URL=your_network_rpc_url

# 部署 StakeManager
forge script script/StakeManager.s.sol:StakeManagerScript \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify

# 保存输出的合约地址，将用作 NodeRegistry 的参数
export STAKE_MANAGER_ADDRESS=deployed_stake_manager_address
```

2. 部署 NodeRegistry 合约：
```shell
# 设置初始节点信息
export NODE_PRIVATE_KEY=your_initial_node_private_key
export NODE_IP="https://your-node-domain.com"
export NODE_APIS="[1,2,3,4,5]"

# 部署 NodeRegistry
forge script script/NodeRegistry.s.sol:NodeRegistryScript \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify
```

环境变量说明：
- PRIVATE_KEY: 部署者的私钥
- RPC_URL: 目标网络的 RPC 地址
- STAKE_MANAGER_ADDRESS: StakeManager 合约地址
- NODE_PRIVATE_KEY: 初始注册服务节点的私钥
- NODE_IP: 初始节点的 IP 或域名
- NODE_APIS: 初始节点支持的 API 列表

快速部署脚本：
```shell
# optimism testnet
./script/deploy.sh optimism-testnet

# optimism mainnet
./script/deploy.sh optimism-mainnet
```

### Deploy example

```
└> ./script/deploy.sh optimism-testnet
Deploying to optimism-testnet...
Compiling contracts...
[⠒] Compiling...
No files changed, compilation skipped
Running deployment script...
[⠒] Compiling...
No files changed, compilation skipped
Traces:
  [504030] NodeRegistryScript::run()
    ├─ [0] VM::envAddress("STAKE_MANAGER_ADDRESS") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::startBroadcast()
    │   └─ ← [Return] 
    ├─ [458423] → new NodeRegistry@0x3F882Ac9f78C7E44e8DeDc852b0c7f04349e2D3d
    │   └─ ← [Return] 2178 bytes of code
    ├─ [0] console::log("NodeRegistry deployed at:", NodeRegistry: [0x3F882Ac9f78C7E44e8DeDc852b0c7f04349e2D3d]) [staticcall]
    │   └─ ← [Stop] 
    ├─ [0] console::log("Using StakeManager at:", 0x1234567890123456789012345678901234567890) [staticcall]
    │   └─ ← [Stop] 
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return] 
    └─ ← [Stop] 


Script ran successfully.

== Logs ==
  NodeRegistry deployed at: 0x3F882Ac9f78C7E44e8DeDc852b0c7f04349e2D3d
  Using StakeManager at: 0x1234567890123456789012345678901234567890

## Setting up 1 EVM.
==========================
Simulated On-chain Traces:

  [458423] → new NodeRegistry@0x3F882Ac9f78C7E44e8DeDc852b0c7f04349e2D3d
    └─ ← [Return] 2178 bytes of code


==========================

Chain 11155420

Estimated gas price: 0.000001727 gwei

Estimated total gas used for script: 712206

Estimated amount required: 0.000000001229979762 ETH

==========================

##### optimism-sepolia
✅  [Success]Hash: 0x212736ca7a8c4eb562bd07f6198b469637e26cb9237a84fb83e9dba2e347f7e4
Contract Address: 0x3F882Ac9f78C7E44e8DeDc852b0c7f04349e2D3d
Block: 23268709
Paid: 0.000000000799530541 ETH (547999 gas * 0.000001459 gwei)

✅ Sequence #1 on optimism-sepolia | Total Paid: 0.000000000799530541 ETH (547999 gas * avg 0.000001459 gwei)
                                                                            

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.
##
Start verification for (1) contracts
Start verifying contract `0x3F882Ac9f78C7E44e8DeDc852b0c7f04349e2D3d` deployed on optimism-sepolia

Submitting verification for [src/NodeRegistry.sol:NodeRegistry] 0x3F882Ac9f78C7E44e8DeDc852b0c7f04349e2D3d.
Submitted contract for verification:
        Response: `OK`
        GUID: `vwfnxyvy2ds4ev7ggp75bqnhuzaakd9smenhycvrha7rna8kvl`
        URL: https://sepolia-optimism.etherscan.io/address/0x3f882ac9f78c7e44e8dedc852b0c7f04349e2d3d
Contract verification status:
Response: `NOTOK`
Details: `Pending in queue`
Contract verification status:
Response: `OK`
Details: `Pass - Verified`
Contract successfully verified
All (1) contracts were verified!

Transactions saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/optimism/broadcast/NodeRegistry.s.sol/11155420/run-latest.json

Sensitive values saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/optimism/cache/NodeRegistry.s.sol/11155420/run-latest.json

Deployment successful!

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```


## 合约功能解释

我们有三个主合约：

### MushroomToken

是 stake 使用的代币，限量为 2100 万个，持有此代币的地址可以参与 stake 和 unstake 操作。

### StakeManager

是 stake 的合约，管理节点的质押和解质押操作。

### NodeRegistry

是注册节点的合约，管理节点的注册和更新。

## 部署流程

### 环境准备

1. 安装依赖：
```bash
# 安装 Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# 安装项目依赖
cd contract/optimism
forge install foundry-rs/forge-std@v1.7.1 --no-commit
forge install OpenZeppelin/openzeppelin-contracts@v4.9.3 --no-commit
```

2. 配置环境变量（创建 .env.optimism-sepolia 文件）：
```bash
# 部署者私钥和 RPC
DEPLOYER_PRIVATE_KEY=your_deployer_private_key
RPC_URL=your_optimism_sepolia_rpc_url

# 初始节点信息
NODE_PRIVATE_KEY=your_initial_node_private_key
NODE_IP="your_node_domain.com"
NODE_APIS="[1,2,3,4,5,6,7,8,9,10,11,12,13]"

# Etherscan API Key
OPTIMISM_ETHERSCAN_API_KEY=your_optimism_etherscan_api_key
```

### 部署步骤

1. 部署 MushroomToken：
```bash
chmod +x script/deploy-*.sh
./script/deploy-token.sh optimism-sepolia
# 记录输出的合约地址，例如：
# MushroomToken deployed at: 0x1234...
```

2. 部署 StakeManager：
```bash
./script/deploy-stake.sh optimism-sepolia <mushroom_token_address>
# 记录输出的合约地址，例如：
# StakeManager deployed at: 0x5678...
```

3. 部署 NodeRegistry：
```bash
./script/deploy-registry.sh optimism-sepolia <stake_manager_address>
# 记录输出的合约地址，例如：
# NodeRegistry deployed at: 0x9abc...
```

### 部署验证

部署完成后，可以在 Optimism Sepolia 区块浏览器上验证合约：
- MushroomToken: https://sepolia-optimism.etherscan.io/address/<mushroom_token_address>
- StakeManager: https://sepolia-optimism.etherscan.io/address/<stake_manager_address>
- NodeRegistry: https://sepolia-optimism.etherscan.io/address/<node_registry_address>

### 合约交互

1. MushroomToken:
- 总供应量：21,000,000 MUSH
- 部署时全部代币铸造给部署者
- 支持标准 ERC20 功能

2. StakeManager:
- 质押代币：使用 MushroomToken
- 质押数量：由合约参数决定
- 支持质押和解质押操作

3. NodeRegistry:
- 需要先在 StakeManager 中质押足够代币
- 使用 NODE_PRIVATE_KEY 作为初始注册服务节点
- 支持节点注册和信息更新



#### Example
Deploying MushroomToken to optimism-sepolia...
[⠒] Compiling...
No files changed, compilation skipped
Traces:
  [752682] MushroomTokenScript::run()
    ├─ [0] VM::envUint("DEPLOYER_PRIVATE_KEY") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::startBroadcast(<pk>)
    │   └─ ← [Return] 
    ├─ [709008] → new MushroomToken@0x822D58f06e7c77B9D17Efbda5Be2378Ec5CDA374
    │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0
xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    │   ├─ emit Transfer(from: 0x0000000000000000000000000000000000000000, to: 0xe24b6f321B0140716a2b671ed0
D983bb64E7DaFA, value: 21000000000000000000000000 [2.1e25])
    │   └─ ← [Return] 2966 bytes of code
    ├─ [0] VM::addr(<pk>) [staticcall]
    │   └─ ← [Return] 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA
    ├─ [3094] MushroomToken::transfer(0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA, 100000000000000000000000 
[1e23])
    │   ├─ emit Transfer(from: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA, to: 0xe24b6f321B0140716a2b671ed0
D983bb64E7DaFA, value: 100000000000000000000000 [1e23])
    │   └─ ← [Return] true
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return] 
    ├─ [0] console::log("MushroomToken deployed at:", MushroomToken: [0x822D58f06e7c77B9D17Efbda5Be2378Ec5C
DA374]) [staticcall]
    │   └─ ← [Stop] 
    └─ ← [Stop] 


Script ran successfully.

== Logs ==
  MushroomToken deployed at: 0x822D58f06e7c77B9D17Efbda5Be2378Ec5CDA374

## Setting up 1 EVM.
==========================
Simulated On-chain Traces:

  [709008] → new MushroomToken@0x822D58f06e7c77B9D17Efbda5Be2378Ec5CDA374
    ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24
b6f321B0140716a2b671ed0D983bb64E7DaFA)
    ├─ emit Transfer(from: 0x0000000000000000000000000000000000000000, to: 0xe24b6f321B0140716a2b671ed0D983
bb64E7DaFA, value: 21000000000000000000000000 [2.1e25])
    └─ ← [Return] 2966 bytes of code

  [7894] MushroomToken::transfer(0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA, 100000000000000000000000 [1e23
])
    ├─ emit Transfer(from: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA, to: 0xe24b6f321B0140716a2b671ed0D983
bb64E7DaFA, value: 100000000000000000000000 [1e23])
    └─ ← [Return] true


==========================

Chain 11155420

Estimated gas price: 0.000001707 gwei

Estimated total gas used for script: 1105801

Estimated amount required: 0.000000001887602307 ETH

==========================

##### optimism-sepolia
✅  [Success]Hash: 0xbb0227a784235e4cae1ef9ba6bcb6c7de9d2c659f3f6b5bdc00fa3e0ee65e7b6
Contract Address: 0x822D58f06e7c77B9D17Efbda5Be2378Ec5CDA374
Block: 23295419
Paid: 0.000000001190890224 ETH (822438 gas * 0.000001448 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x1cd0cc48a9cd84c9abef3dfb8e9b123b9e8e5363307d139b58aff3d07f85713e
Block: 23295419
Paid: 0.000000000038734 ETH (26750 gas * 0.000001448 gwei)



==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/optimism/broadcast/MushroomToke
n.s.sol/11155420/run-latest.json

Sensitive values saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/optimism/cache/MushroomToke
n.s.sol/11155420/run-latest.json

MushroomToken deployment completed successfully!
Contract deployed at: 


Start verifying contract `0x822D58f06e7c77B9D17Efbda5Be2378Ec5CDA374` deployed on optimism-sepolia

Submitting verification for [src/MushroomToken.sol:MushroomToken] 0x822D58f06e7c77B9D17Efbda5Be2378Ec5CDA374.
Submitted contract for verification:
        Response: `OK`
        GUID: `fi4ty8ytkvvhxgkkbvufu3ss7b5w8kavfafbpvuygmcjxjrrvf`
        URL: https://sepolia-optimism.etherscan.io/address/0x822d58f06e7c77b9d17efbda5be2378ec5cda374
Contract verification status:
Response: `NOTOK`
Details: `Pending in queue`
Contract verification status:
Response: `OK`
Details: `Pass - Verified`
Contract successfully verified
Contract verification completed successfully!