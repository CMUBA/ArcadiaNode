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
        nodeRegistry: '节点注册合约',
        hero: {
            nft: '英雄 NFT 合约',
            metadata: '英雄元数据合约',
            core: '英雄核心合约',
            test: '英雄测试页面'
        }
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
    newNodeInfo: '新节点信息',
    nodePrivateKey: '节点私钥',
    privateKeyWarning: '请妥善保管私钥！',
    enterOrGenerateAddress: '输入或通过生成按钮创建新地址',
    enterOrGenerateKey: '输入或通过生成按钮创建新私钥',
    ipDomainExample: '示例：https://example.com',
    apiExample: '示例：[1,2,3,4,5]',
    generateNewKeypair: '生成新密钥对',
    transferETH: '转账 ETH',
    transferTokens: '转账代币',
    approveTokens: '授权代币',
    stakeTokens: '质押代币',
    getChallenge: '1. 获取 Challenge',
    signChallenge: '2. 签名 Challenge',
    signature: '签名',
    registrationProcess: '注册流程',
    requestResponseInfo: '请求和响应信息',
    requestInfo: '请求信息',
    responseInfo: '响应信息',
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
    extend: '扩展服务',
    hero: {
        test: {
            title: '英雄合约测试',
            wallet: {
                connect: '连接钱包',
                connected: '已连接',
                address: '地址'
            },
            race: {
                title: '种族数据测试',
                select: '选择种族',
                attributes: '基础属性',
                description: '描述'
            },
            class: {
                title: '职业数据测试',
                select: '选择职业',
                attributes: '基础属性',
                growth: '成长率',
                description: '描述'
            },
            skill: {
                title: '技能数据测试',
                season: '选择季节',
                id: '技能 ID',
                level: '等级',
                name: '名称',
                points: '所需点数'
            },
            creation: {
                title: '创建英雄',
                name: '英雄名称',
                race: '选择种族',
                class: '选择职业',
                create: '创建英雄',
                success: '英雄创建成功！',
                error: '创建英雄失败'
            }
        }
    }
}; --
完整的测试页面，包含以下功能：
钱包连接
显示连接状态
连接钱包按钮
显示当前网络和地址
种族数据测试
下拉菜单选择种族
显示种族的基础属性和描述
实时更新数据显示
职业数据测试
下拉菜单选择职业
显示职业的基础属性、成长率和描述
实时更新数据显示
技能数据测试
选择季节、技能ID和等级
显示技能的详细信息
实时更新数据显示
英雄创建流程
输入英雄名称
选择种族和职业
创建英雄并显示交易结果
使用说明：
打开页面后，首先点击 "Connect Wallet" 连接 MetaMask
可以分别测试种族、职业和技能数据的读取
创建英雄时需要先连接钱包，然后填写信息并点击创建
接下来，我们需要：
确保 ethers.min.js 文件在正确的位置
更新语言配置文件以支持多语言
添加页面路由
你想从哪个部分开始？



# 编译合约
npm run move:compile

# 运行测试
npm run move:test

# 发布合约
npm run move:publish

# 编译
npm run move:compile

# 运行测试
npm run move:test

# 发布合约
npm run move:publish

# 运行初始化脚本
aptos move run --function-id $MODULE_ADDRESS::init_metadata
aptos move run --function-id $MODULE_ADDRESS::init_hero




No key given, generating key...
Account 0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8 doesn't exist, creating it and funding it with 100000000 Octas
Account 0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8 funded successfully

---
Aptos CLI is now set up for account 0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8 as profile default!




./deploy-nft.sh             
[⠒] Compiling...
No files changed, compilation skipped
Traces:
  [3394122] DeployHeroNFTScript::run()
    ├─ [0] VM::envUint("PRIVATE_KEY") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::envAddress("PAYMENT_TOKEN_ADDRESS") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::envUint("NATIVE_PRICE") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::envUint("TOKEN_PRICE") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::startBroadcast(<pk>)
    │   └─ ← [Return] 
    ├─ [360715] → new ProxyAdmin@0x7Cf1C7d93Cf18b37FEbb03D02565FBC8887d906C
    │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
    │   └─ ← [Return] 1683 bytes of code
    ├─ [2696875] → new HeroNFT@0x0eb44B96bC23A6362d383eF04bE67501251cF227
    │   ├─ emit Initialized(version: 255)
    │   └─ ← [Return] 13352 bytes of code
    ├─ [226512] → new HeroProxy@0xB8357F7f41125d4b24AD052c1b7288BeF5C43446
    │   ├─ emit Upgraded(implementation: HeroNFT: [0x0eb44B96bC23A6362d383eF04bE67501251cF227])
    │   ├─ [165448] HeroNFT::initialize(0x0000000000000000000000000000000000000000, 100000000000000000 [1e17], 100000000000000000000 [1e20]) [delegatecall]
    │   │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
    │   │   ├─ emit Initialized(version: 1)
    │   │   └─ ← [Stop] 
    │   └─ ← [Return] 177 bytes of code
    ├─ [0] console::log("ProxyAdmin deployed to:", ProxyAdmin: [0x7Cf1C7d93Cf18b37FEbb03D02565FBC8887d906C]) [staticcall]
    │   └─ ← [Stop] 
    ├─ [0] console::log("HeroNFT Implementation deployed to:", HeroNFT: [0x0eb44B96bC23A6362d383eF04bE67501251cF227]) [staticcall]
    │   └─ ← [Stop] 
    ├─ [0] console::log("HeroNFT Proxy deployed to:", HeroProxy: [0xB8357F7f41125d4b24AD052c1b7288BeF5C43446]) [staticcall]
    │   └─ ← [Stop] 
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return] 
    └─ ← [Stop] 


Script ran successfully.

== Logs ==
  ProxyAdmin deployed to: 0x7Cf1C7d93Cf18b37FEbb03D02565FBC8887d906C
  HeroNFT Implementation deployed to: 0x0eb44B96bC23A6362d383eF04bE67501251cF227
  HeroNFT Proxy deployed to: 0xB8357F7f41125d4b24AD052c1b7288BeF5C43446

## Setting up 1 EVM.
==========================
Simulated On-chain Traces:

  [360715] → new ProxyAdmin@0x7Cf1C7d93Cf18b37FEbb03D02565FBC8887d906C
    ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
    └─ ← [Return] 1683 bytes of code

  [2696875] → new HeroNFT@0x0eb44B96bC23A6362d383eF04bE67501251cF227
    ├─ emit Initialized(version: 255)
    └─ ← [Return] 13352 bytes of code

  [229012] → new HeroProxy@0xB8357F7f41125d4b24AD052c1b7288BeF5C43446
    ├─ emit Upgraded(implementation: HeroNFT: [0x0eb44B96bC23A6362d383eF04bE67501251cF227])
    ├─ [165448] HeroNFT::initialize(0x0000000000000000000000000000000000000000, 100000000000000000 [1e17], 100000000000000000000 [1e20]) [delegatecall]
    │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266)
    │   ├─ emit Initialized(version: 1)
    │   └─ ← [Stop] 
    └─ ← [Return] 177 bytes of code


==========================

Chain 11155420

Estimated gas price: 0.000001737 gwei

Estimated total gas used for script: 4819080

Estimated amount required: 0.00000000837074196 ETH

==========================

Transactions saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/broadcast/DeployHeroNFT.s.sol/11155420/run-latest.json

Sensitive values saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/cache/DeployHeroNFT.s.sol/11155420/run-latest.json

Error: 
Failed to send transaction

Context:
- server returned an error response: error code -32000: insufficient funds for gas * price + value: balance 11770169349, tx cost 28312769221227, overshot 28300999051878



# Deployed Contract Addresses
HERO_NFT_PROXY=0xA3bc0c60b4C081401846478C9877A1d269b5DaC8
HERO_NFT_IMPLEMENTATION=0x4dFBe8B0dB1F69Cb4d7761b65a277E1a54107c92
PROXY_ADMIN=0x11ca946e52aB8054Ea4478346Dd9732bccA52513

HERO_METADATA_PROXY=0xEB2869219eB31053129373F741928BfdbB62A1d2
HERO_METADATA_IMPLEMENTATION=0xedC0F4151d64b7f018a6a7629B9AdE28A517C73c
HERO_METADATA_PROXY_ADMIN=0x87dA3f8493f51C0626e7f83697DC4B1B015Dcf93

HERO_PROXY=0x58b39497113d34624C67Ee984A762022CEC4af21
HERO_IMPLEMENTATION=0x927C97185A605e7Dc4215973673F9CD1748c90BB
HERO_PROXY_ADMIN=0xDf7AE0A227de731124155603cdF592Aa4AAC8AF4


--------
7th Feb 部署NFT log

```
./deploy-nft.sh
[⠒] Compiling...
No files changed, compilation skipped
Traces:
  [3394122] DeployHeroNFTScript::run()
    ├─ [0] VM::envUint("PRIVATE_KEY") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::envAddress("PAYMENT_TOKEN_ADDRESS") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::envUint("NATIVE_PRICE") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::envUint("TOKEN_PRICE") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::startBroadcast(<pk>)
    │   └─ ← [Return]
    ├─ [360715] → new ProxyAdmin@0x1F70eB943a54Fc3A0Ff5ef43330aB9498E6e0d53
    │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    │   └─ ← [Return] 1683 bytes of code
    ├─ [2696875] → new HeroNFT@0xe888CA2F4D287f15EFC494284a595d5Ee34365F1
    │   ├─ emit Initialized(version: 255)
    │   └─ ← [Return] 13352 bytes of code
    ├─ [226512] → new HeroProxy@0x5915c1D71bDfA5276A98FC9FE9074370721807c2
    │   ├─ emit Upgraded(implementation: HeroNFT: [0xe888CA2F4D287f15EFC494284a595d5Ee34365F1])
    │   ├─ [165448] HeroNFT::initialize(0x0000000000000000000000000000000000000000, 100000000000000000 [1e17], 100000000000000000000 [1e20]) [delegatecall]
    │   │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    │   │   ├─ emit Initialized(version: 1)
    │   │   └─ ← [Stop]
    │   └─ ← [Return] 177 bytes of code
    ├─ [0] console::log("ProxyAdmin deployed to:", ProxyAdmin: [0x1F70eB943a54Fc3A0Ff5ef43330aB9498E6e0d53]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("HeroNFT Implementation deployed to:", HeroNFT: [0xe888CA2F4D287f15EFC494284a595d5Ee34365F1]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("HeroNFT Proxy deployed to:", HeroProxy: [0x5915c1D71bDfA5276A98FC9FE9074370721807c2]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return]
    └─ ← [Stop]


Script ran successfully.

== Logs ==
  ProxyAdmin deployed to: 0x1F70eB943a54Fc3A0Ff5ef43330aB9498E6e0d53
  HeroNFT Implementation deployed to: 0xe888CA2F4D287f15EFC494284a595d5Ee34365F1
  HeroNFT Proxy deployed to: 0x5915c1D71bDfA5276A98FC9FE9074370721807c2

## Setting up 1 EVM.
==========================
Simulated On-chain Traces:

  [360715] → new ProxyAdmin@0x1F70eB943a54Fc3A0Ff5ef43330aB9498E6e0d53
    ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    └─ ← [Return] 1683 bytes of code

  [2696875] → new HeroNFT@0xe888CA2F4D287f15EFC494284a595d5Ee34365F1
    ├─ emit Initialized(version: 255)
    └─ ← [Return] 13352 bytes of code

  [229012] → new HeroProxy@0x5915c1D71bDfA5276A98FC9FE9074370721807c2
    ├─ emit Upgraded(implementation: HeroNFT: [0xe888CA2F4D287f15EFC494284a595d5Ee34365F1])
    ├─ [165448] HeroNFT::initialize(0x0000000000000000000000000000000000000000, 100000000000000000 [1e17], 100000000000000000000 [1e20]) [delegatecall]
    │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    │   ├─ emit Initialized(version: 1)
    │   └─ ← [Stop]
    └─ ← [Return] 177 bytes of code


==========================

Chain 11155420

Estimated gas price: 0.000971014 gwei

Estimated total gas used for script: 4819080

Estimated amount required: 0.00000467939414712 ETH

==========================

##### optimism-sepolia
✅  [Success]Hash: 0x968ad3fa30847902a08cc93f9c28eae4cdd0c8e2ff918bd5a74f1ba83dc82e14
Contract Address: 0x1F70eB943a54Fc3A0Ff5ef43330aB9498E6e0d53
Block: 23548337
Paid: 0.000000428847512541 ETH (441777 gas * 0.000970733 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xb1b5e0e45c0163915d8cc64a7396ff3612e318a99b9382ab016a55421d02b26f
Contract Address: 0x5915c1D71bDfA5276A98FC9FE9074370721807c2
Block: 23548337
Paid: 0.000000294242762562 ETH (303114 gas * 0.000970733 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xc1fc56564cb8f512b652a706d0cb86cee15bc8b5e4a7779844a7e2b242aa4f3a
Contract Address: 0xe888CA2F4D287f15EFC494284a595d5Ee34365F1
Block: 23548337
Paid: 0.000002876434284081 ETH (2963157 gas * 0.000970733 gwei)

✅ Sequence #1 on optimism-sepolia | Total Paid: 0.000003599524559184 ETH (3708048 gas * avg 0.000970733 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.
##
Start verification for (3) contracts
Start verifying contract `0x1F70eB943a54Fc3A0Ff5ef43330aB9498E6e0d53` deployed on optimism-sepolia

Submitting verification for [lib/openzeppelin-contracts/contracts/proxy/transparent/ProxyAdmin.sol:ProxyAdmin] 0x1F70eB943a54Fc3A0Ff5ef43330aB9498E6e0d53.
Submitted contract for verification:
	Response: `OK`
	GUID: `hwcm6me8mmqfds5ucnmhwatrw8baa2j5bw4ujdrtrhnuxjvhyf`
	URL: https://sepolia-optimism.etherscan.io/address/0x1f70eb943a54fc3a0ff5ef43330ab9498e6e0d53
Contract verification status:
Response: `NOTOK`
Details: `Pending in queue`
Contract verification status:
Response: `OK`
Details: `Pass - Verified`
Contract successfully verified
Start verifying contract `0xe888CA2F4D287f15EFC494284a595d5Ee34365F1` deployed on optimism-sepolia

Submitting verification for [src/core/HeroNFT.sol:HeroNFT] 0xe888CA2F4D287f15EFC494284a595d5Ee34365F1.
Submitted contract for verification:
	Response: `OK`
	GUID: `fsswh73lqxc5xktl5gpbkpwtrfnztcdj2wltdffwrypthmj2sc`
	URL: https://sepolia-optimism.etherscan.io/address/0xe888ca2f4d287f15efc494284a595d5ee34365f1
Contract verification status:
Response: `NOTOK`
Details: `Pending in queue`
Contract verification status:
Response: `OK`
Details: `Pass - Verified`
Contract successfully verified
Start verifying contract `0x5915c1D71bDfA5276A98FC9FE9074370721807c2` deployed on optimism-sepolia

Submitting verification for [src/proxy/HeroProxy.sol:HeroProxy] 0x5915c1D71bDfA5276A98FC9FE9074370721807c2.
Submitted contract for verification:
	Response: `OK`
	GUID: `fpunvsvzv2j3iekt3uz18p1sjlz3cdxlzgmnqfzux5jdcpfazp`
	URL: https://sepolia-optimism.etherscan.io/address/0x5915c1d71bdfa5276a98fc9fe9074370721807c2
Contract verification status:
Response: `NOTOK`
Details: `Pending in queue`
Contract verification status:
Response: `OK`
Details: `Pass - Verified`
Contract successfully verified
All (3) contracts were verified!

Transactions saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/broadcast/DeployHeroNFT.s.sol/11155420/run-latest.json

Sensitive values saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/cache/DeployHeroNFT.s.sol/11155420/run-latest.json
```


deploy meta

```
./deploy-meta.sh
[⠢] Compiling...
No files changed, compilation skipped
Traces:
  [2347667] DeployHeroMetadataScript::run()
    ├─ [0] VM::envBytes32("HERO_PRIVATE_KEY") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::startBroadcast(<pk>)
    │   └─ ← [Return]
    ├─ [360715] → new ProxyAdmin@0xCd1ceF34cbc358c3338A5eEa3392D0f46D3f3232
    │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    │   └─ ← [Return] 1683 bytes of code
    ├─ [1770609] → new HeroMetadata@0xe10e8cc3E241ecc3E02431CABcc66199400d0Bbe
    │   ├─ emit Initialized(version: 255)
    │   └─ ← [Return] 8726 bytes of code
    ├─ [108961] → new HeroProxy@0xb6A58680db8ffA71B8eb219e11A8B1d267D01095
    │   ├─ emit Upgraded(implementation: HeroMetadata: [0xe10e8cc3E241ecc3E02431CABcc66199400d0Bbe])
    │   ├─ [48336] HeroMetadata::initialize() [delegatecall]
    │   │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    │   │   ├─ emit Initialized(version: 1)
    │   │   └─ ← [Stop]
    │   └─ ← [Return] 177 bytes of code
    ├─ [0] console::log("ProxyAdmin deployed to:", ProxyAdmin: [0xCd1ceF34cbc358c3338A5eEa3392D0f46D3f3232]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("HeroMetadata Implementation deployed to:", HeroMetadata: [0xe10e8cc3E241ecc3E02431CABcc66199400d0Bbe]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("HeroMetadata Proxy deployed to:", HeroProxy: [0xb6A58680db8ffA71B8eb219e11A8B1d267D01095]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return]
    └─ ← [Stop]


Script ran successfully.

== Logs ==
  ProxyAdmin deployed to: 0xCd1ceF34cbc358c3338A5eEa3392D0f46D3f3232
  HeroMetadata Implementation deployed to: 0xe10e8cc3E241ecc3E02431CABcc66199400d0Bbe
  HeroMetadata Proxy deployed to: 0xb6A58680db8ffA71B8eb219e11A8B1d267D01095

## Setting up 1 EVM.
==========================
Simulated On-chain Traces:

  [360715] → new ProxyAdmin@0xCd1ceF34cbc358c3338A5eEa3392D0f46D3f3232
    ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    └─ ← [Return] 1683 bytes of code

  [1770609] → new HeroMetadata@0xe10e8cc3E241ecc3E02431CABcc66199400d0Bbe
    ├─ emit Initialized(version: 255)
    └─ ← [Return] 8726 bytes of code

  [111461] → new HeroProxy@0xb6A58680db8ffA71B8eb219e11A8B1d267D01095
    ├─ emit Upgraded(implementation: HeroMetadata: [0xe10e8cc3E241ecc3E02431CABcc66199400d0Bbe])
    ├─ [48336] HeroMetadata::initialize() [delegatecall]
    │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    │   ├─ emit Initialized(version: 1)
    │   └─ ← [Stop]
    └─ ← [Return] 177 bytes of code


==========================

Chain 11155420

Estimated gas price: 0.001000552 gwei

Estimated total gas used for script: 3366536

Estimated amount required: 0.000003368394327872 ETH

==========================

##### optimism-sepolia
✅  [Success]Hash: 0xfd66bf7942367758e4ca3bef20ffeb72eb454d40b4e51dcdc3db81cc6fbfcd84
Contract Address: 0xe10e8cc3E241ecc3E02431CABcc66199400d0Bbe
Block: 23548509
Paid: 0.000001964158958292 ETH (1963617 gas * 0.001000276 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x0e1aa4086d2cdc4dab7b88701d3ed36aa751a6b1abfeab68d85ec21a31b5a354
Contract Address: 0xCd1ceF34cbc358c3338A5eEa3392D0f46D3f3232
Block: 23548509
Paid: 0.000000441898930452 ETH (441777 gas * 0.001000276 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xbecf498b92611d3a2c0f18ce3a58f2c7fd55d70247e148b3174e249c7b1d97ec
Contract Address: 0xb6A58680db8ffA71B8eb219e11A8B1d267D01095
Block: 23548509
Paid: 0.000000185068064692 ETH (185017 gas * 0.001000276 gwei)

✅ Sequence #1 on optimism-sepolia | Total Paid: 0.000002591125953436 ETH (2590411 gas * avg 0.001000276 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.
##
Start verification for (3) contracts
Start verifying contract `0xCd1ceF34cbc358c3338A5eEa3392D0f46D3f3232` deployed on optimism-sepolia

Submitting verification for [lib/openzeppelin-contracts/contracts/proxy/transparent/ProxyAdmin.sol:ProxyAdmin] 0xCd1ceF34cbc358c3338A5eEa3392D0f46D3f3232.
Submitted contract for verification:
	Response: `OK`
	GUID: `jgts5snc39ssmtvyw3sy3pufw45nfv6qwptfj8cvzecr3eir85`
	URL: https://sepolia-optimism.etherscan.io/address/0xcd1cef34cbc358c3338a5eea3392d0f46d3f3232
Contract verification status:
Response: `NOTOK`
Details: `Already Verified`
Contract source code already verified
Start verifying contract `0xe10e8cc3E241ecc3E02431CABcc66199400d0Bbe` deployed on optimism-sepolia

Submitting verification for [src/core/HeroMetadata.sol:HeroMetadata] 0xe10e8cc3E241ecc3E02431CABcc66199400d0Bbe.
Submitted contract for verification:
	Response: `OK`
	GUID: `jdh2lmmnw1msmy32pyzfenrwyplwcqmefbbuztcyuvbbazt5n2`
	URL: https://sepolia-optimism.etherscan.io/address/0xe10e8cc3e241ecc3e02431cabcc66199400d0bbe
Contract verification status:
Response: `NOTOK`
Details: `Pending in queue`

Contract verification status:
Response: `OK`
Details: `Pass - Verified`
Contract successfully verified
Start verifying contract `0xb6A58680db8ffA71B8eb219e11A8B1d267D01095` deployed on optimism-sepolia

Submitting verification for [src/proxy/HeroProxy.sol:HeroProxy] 0xb6A58680db8ffA71B8eb219e11A8B1d267D01095.
Submitted contract for verification:
	Response: `OK`
	GUID: `gjrsqxmkuxasc7f7bbmauvmtmjbfnzwh7bacpnkegdzfx3j4xt`
	URL: https://sepolia-optimism.etherscan.io/address/0xb6a58680db8ffa71b8eb219e11a8b1d267d01095
Contract verification status:
Response: `NOTOK`
Details: `Pending in queue`
Contract verification status:
Response: `NOTOK`
Details: `Already Verified`
Contract source code already verified
All (3) contracts were verified!

Transactions saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/broadcast/DeployHeroMetadata.s.sol/11155420/run-latest.json

Sensitive values saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/cache/DeployHeroMetadata.s.sol/11155420/run-latest.json
```


hero deploy

```
./deploy-hero.sh
[⠆] Compiling...
No files changed, compilation skipped
Traces:
  [2570941] DeployHeroScript::run()
    ├─ [0] VM::envBytes32("HERO_PRIVATE_KEY") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::envAddress("HERO_NFT_ADDRESS") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::startBroadcast(<pk>)
    │   └─ ← [Return]
    ├─ [360715] → new ProxyAdmin@0xb3aF613b042259A3cC9c20AE2eF616Ab385c8d7c
    │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    │   └─ ← [Return] 1683 bytes of code
    ├─ [1990452] → new Hero@0xD7d3d98adD4aA07bfaa88fFcD37AC16A53750ba9
    │   ├─ emit Initialized(version: 255)
    │   └─ ← [Return] 9824 bytes of code
    ├─ [111642] → new HeroProxy@0x5aEe59c7D6434eC6f83066C388E6fe76959F9ec1
    │   ├─ emit Upgraded(implementation: Hero: [0xD7d3d98adD4aA07bfaa88fFcD37AC16A53750ba9])
    │   ├─ [50871] Hero::initialize() [delegatecall]
    │   │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    │   │   ├─ emit Initialized(version: 1)
    │   │   └─ ← [Stop]
    │   └─ ← [Return] 177 bytes of code
    ├─ [0] console::log("ProxyAdmin deployed to:", ProxyAdmin: [0xb3aF613b042259A3cC9c20AE2eF616Ab385c8d7c]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("Hero Implementation deployed to:", Hero: [0xD7d3d98adD4aA07bfaa88fFcD37AC16A53750ba9]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("Hero Proxy deployed to:", HeroProxy: [0x5aEe59c7D6434eC6f83066C388E6fe76959F9ec1]) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return]
    └─ ← [Stop]


Script ran successfully.

== Logs ==
  ProxyAdmin deployed to: 0xb3aF613b042259A3cC9c20AE2eF616Ab385c8d7c
  Hero Implementation deployed to: 0xD7d3d98adD4aA07bfaa88fFcD37AC16A53750ba9
  Hero Proxy deployed to: 0x5aEe59c7D6434eC6f83066C388E6fe76959F9ec1

## Setting up 1 EVM.
==========================
Simulated On-chain Traces:

  [360715] → new ProxyAdmin@0xb3aF613b042259A3cC9c20AE2eF616Ab385c8d7c
    ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    └─ ← [Return] 1683 bytes of code

  [1990452] → new Hero@0xD7d3d98adD4aA07bfaa88fFcD37AC16A53750ba9
    ├─ emit Initialized(version: 255)
    └─ ← [Return] 9824 bytes of code

  [114142] → new HeroProxy@0x5aEe59c7D6434eC6f83066C388E6fe76959F9ec1
    ├─ emit Upgraded(implementation: Hero: [0xD7d3d98adD4aA07bfaa88fFcD37AC16A53750ba9])
    ├─ [50871] Hero::initialize() [delegatecall]
    │   ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    │   ├─ emit Initialized(version: 1)
    │   └─ ← [Stop]
    └─ ← [Return] 177 bytes of code


==========================

Chain 11155420

Estimated gas price: 0.001005557 gwei

Estimated total gas used for script: 3678370

Estimated amount required: 0.00000369881070209 ETH

==========================

##### optimism-sepolia
✅  [Success]Hash: 0x266977d3f78373f776c9f312c5a6a58ce88b55175c922030b5016c29aa011cb0
Contract Address: 0xD7d3d98adD4aA07bfaa88fFcD37AC16A53750ba9
Block: 23548592
Paid: 0.000002212124481732 ETH (2200508 gas * 0.001005279 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x5682a5bafd1558de9ea159cd3cfe4e7e8cb97a90b04d25bf5bd96469cfc8e292
Contract Address: 0xb3aF613b042259A3cC9c20AE2eF616Ab385c8d7c
Block: 23548592
Paid: 0.000000444109140783 ETH (441777 gas * 0.001005279 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xd1b6f267a68a9afd43cd21058ed0d10e046992ac396d277ce3277b2d2312110c
Contract Address: 0x5aEe59c7D6434eC6f83066C388E6fe76959F9ec1
Block: 23548592
Paid: 0.000000189060810972 ETH (188068 gas * 0.001005279 gwei)

✅ Sequence #1 on optimism-sepolia | Total Paid: 0.000002845294433487 ETH (2830353 gas * avg 0.001005279 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.
##
Start verification for (3) contracts
Start verifying contract `0xb3aF613b042259A3cC9c20AE2eF616Ab385c8d7c` deployed on optimism-sepolia

Submitting verification for [lib/openzeppelin-contracts/contracts/proxy/transparent/ProxyAdmin.sol:ProxyAdmin] 0xb3aF613b042259A3cC9c20AE2eF616Ab385c8d7c.
Submitted contract for verification:
	Response: `OK`
	GUID: `nhinzkppx7l7yw1tkbx4inq8tfwgviq89vceyj3fd1rdtzevf4`
	URL: https://sepolia-optimism.etherscan.io/address/0xb3af613b042259a3cc9c20ae2ef616ab385c8d7c
Contract verification status:
Response: `NOTOK`
Details: `Pending in queue`
Contract verification status:
Response: `NOTOK`
Details: `Already Verified`
Contract source code already verified
Start verifying contract `0xD7d3d98adD4aA07bfaa88fFcD37AC16A53750ba9` deployed on optimism-sepolia

Submitting verification for [src/core/Hero.sol:Hero] 0xD7d3d98adD4aA07bfaa88fFcD37AC16A53750ba9.
Submitted contract for verification:
	Response: `OK`
	GUID: `hixtjasbuiphsdiey4smvrzhqixdfj2s2s2hbgb3nnrjrx8dvp`
	URL: https://sepolia-optimism.etherscan.io/address/0xd7d3d98add4aa07bfaa88ffcd37ac16a53750ba9
Contract verification status:
Response: `NOTOK`
Details: `Pending in queue`
Contract verification status:
Response: `OK`
Details: `Pass - Verified`
Contract successfully verified
Start verifying contract `0x5aEe59c7D6434eC6f83066C388E6fe76959F9ec1` deployed on optimism-sepolia

Submitting verification for [src/proxy/HeroProxy.sol:HeroProxy] 0x5aEe59c7D6434eC6f83066C388E6fe76959F9ec1.
Submitted contract for verification:
	Response: `OK`
	GUID: `bbds9s9fd1cfwahxfsc14hspry1qsjbj7rjqnah9zk4as7sqtt`
	URL: https://sepolia-optimism.etherscan.io/address/0x5aee59c7d6434ec6f83066c388e6fe76959f9ec1
Contract verification status:
Response: `NOTOK`
Details: `Pending in queue`
Contract verification status:
Response: `NOTOK`
Details: `Already Verified`
Contract source code already verified
All (3) contracts were verified!

Transactions saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/broadcast/DeployHero.s.sol/11155420/run-latest.json

Sensitive values saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/cache/DeployHero.s.sol/11155420/run-latest.json
```

init metadat 

```
./init-contract-data.sh
[⠢] Compiling...
No files changed, compilation skipped
Script ran successfully.

## Setting up 1 EVM.

==========================

Chain 11155420

Estimated gas price: 0.00005209 gwei

Estimated total gas used for script: 3051559

Estimated amount required: 0.00000015895570831 ETH

==========================

##### optimism-sepolia
✅  [Success]Hash: 0x189288ca3ed9303d9c0ff5d7aa6162c100fb21942e7b7401545457183183c7ae
Block: 23548987
Paid: 0.000000014116614225 ETH (140779 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x5382ff1e2e047853f8cd4cbc53cf3491533c8e078fc1d3872fba134e3280e4da
Block: 23548987
Paid: 0.00000001543412745 ETH (153918 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x1ef61e9c11c2de990a4aae89e4650c7d6280d2c48a9c28387331e26567c9cb99
Block: 23548987
Paid: 0.00000001544134725 ETH (153990 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x3256fe8b3f12bd2b346252bf67e5dbf6805bd5e2bb6cc51a0922a82346baa177
Block: 23548987
Paid: 0.000000010936091775 ETH (109061 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xe7ac28708b707cf34cc1ee61961dee9f43bb280838f122edcd1cd15e4d5d37d2
Block: 23548987
Paid: 0.00000001543773735 ETH (153954 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xa449ed0abf20357b5995671c90464a5b46d52c44533357f010b7b76a8037d42f
Block: 23548987
Paid: 0.000000016349738475 ETH (163049 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x2b763be891079eddeccfd5523e7f52f44c53bf4067ecb239313bf3d7aa3c9db7
Block: 23548987
Paid: 0.000000010940904975 ETH (109109 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xd63a9c94f36e3d301e249f508bd17979218899ae6a089fabda89b368710762ee
Block: 23548987
Paid: 0.0000000186134466 ETH (185624 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xe45a97fa58ba6ad58d6cb902ff4f8297eaa2e8254147d3f802008d3a8469c0ef
Block: 23548988
Paid: 0.0000000079586262 ETH (79368 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xd1086d6308d598b482254fa71fe46ed8b1f3fb7111c1d9db403787ccfd219832
Block: 23548988
Paid: 0.0000000079550163 ETH (79332 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xe04e0524fd4336710d2ea611d637db0a14e1549ab308dd8ef91d35e6aa344059
Block: 23548988
Paid: 0.0000000079682526 ETH (79464 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xae7f6d4fbf28e751524e90ab9dc2ac18e75adfdde5c4928c78dbe2fceb7c06a7
Block: 23548988
Paid: 0.000000007965846 ETH (79440 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xb932dc2c1674d8b2bbb96388af091552e70c03c896eb7a2abca73a387d61cba0
Block: 23548988
Paid: 0.0000000079694559 ETH (79476 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xeae19e8af125f9f535449704df89ba05daf2c9431ecf264efa193ba710664be7
Block: 23548988
Paid: 0.0000000079646427 ETH (79428 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xd10d6885b6519809687cd8c898b89319c8f8f19d97647dd00721a9713c4a0f32
Block: 23548988
Paid: 0.000000014119020825 ETH (140803 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xf99622667f98f48212be30eccc67de00ff7331e2390cda541bc1f5383ddc043f
Block: 23548988
Paid: 0.0000000079682526 ETH (79464 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x4778e2b0866f4eafb54d2fc86727c5b9f4e88ca67e352346312a215d06fb2f4c
Block: 23548988
Paid: 0.0000000079634394 ETH (79416 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x7ae624c0afcd7b5e5ffe0aa274e37e21955aad2916b7d932234e0d31ad74a7dd
Block: 23548988
Paid: 0.0000000079634394 ETH (79416 gas * 0.000100275 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x61227fac03c3afa3209af92e8ef7f86f9dee83f9751904128ef4bac4a94daeb9
Block: 23548988
Paid: 0.000000014109394425 ETH (140707 gas * 0.000100275 gwei)

✅ Sequence #1 on optimism-sepolia | Total Paid: 0.00000021717539445 ETH (2165798 gas * avg 0.000100275 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/broadcast/InitMetadata.s.sol/11155420/run-latest.json

Sensitive values saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/cache/InitMetadata.s.sol/11155420/run-latest.json
```


1. 已经部署成功 nft，metadata和hero相关合约，地址已放入env变量,metadata合约已经初始化完成
2. 已经开发完成 @hero-test.html 请阅读代码，了解对Ethereum Optimism Sepolia链的hero测试过程，后面还有aptos链的hero测试，请在client首页Chain Interaction区域，添加hero-test页面链接，进行hero测试
3. 已经完成复制对应的ABI（从contract/hero目录下的out目录搜索相关合约的ABI）到client/public/js/abi目录下，请检查是否是最新的，可以生成一个检查更新和复制abi的脚本
4. 禁止使用cdn外部文件
getAcceptedTokens


hero-test.html:481 Failed to load NFT contracts: TypeError: heroContract.getRegisteredNFTs is not a function
    at loadRegisteredNFTContracts (hero-test.html:464:57)
    at connectWallet (hero-test.html:129:23)
    at async hero-test.html:224:25
loadRegisteredNFTContracts @ hero-test.html:481
connectWallet @ hero-test.html:129
await in connectWallet
(anonymous) @ hero-test.html:224
load
(anonymous) @ hero-test.html:183Understand this errorAI
hero-test.html:481 Failed to load NFT contracts: TypeError: heroContract.getRegisteredNFTs is not a function
    at loadRegisteredNFTContracts (hero-test.html:464:57)
    at hero-test.html:247:27
loadRegisteredNFTContracts @ hero-test.html:481
(anonymous) @ hero-test.html:247
load
(anonymous) @ hero-test.html:183Understand this errorAI