# Deploy History
```
source .env && forge script script/DeployAndInit.s.sol:DeployAndInitScript --rpc-url $OPTIMISM_SEPOLIA_RPC_URL --broadcast -vvvv

```
## old Hero Deployed Contract Addresses
VITE_HERO_NFT_PROXY=0x5915c1D71bDfA5276A98FC9FE9074370721807c2
VITE_HERO_NFT_IMPLEMENTATION=0xe888CA2F4D287f15EFC494284a595d5Ee34365F1
VITE_PROXY_ADMIN=0x1F70eB943a54Fc3A0Ff5ef43330aB9498E6e0d53

VITE_HERO_METADATA_PROXY=0xb6A58680db8ffA71B8eb219e11A8B1d267D01095
VITE_HERO_METADATA_IMPLEMENTATION=0xCd1ceF34cbc358c3338A5eEa3392D0f46D3f3232
VITE_HERO_METADATA_PROXY_ADMIN=0xCd1ceF34cbc358c3338A5eEa3392D0f46D3f3232

VITE_HERO_PROXY=0x5aEe59c7D6434eC6f83066C388E6fe76959F9ec1
VITE_HERO_IMPLEMENTATION=0xD7d3d98adD4aA07bfaa88fFcD37AC16A53750ba9
VITE_HERO_PROXY_ADMIN=0xb3aF613b042259A3cC9c20AE2eF616Ab385c8d7c


## Deploy on Feb 9th, 2025 17:12

### Contract Addresses
```
# Hero Deployed Contract Addresses
VITE_HERO_NFT_PROXY=0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c
VITE_HERO_NFT_IMPLEMENTATION=0x85A831359F0983F1Ef6DAF13C9337c8a8e25561F
VITE_PROXY_ADMIN=0x909A58593C71F2F24d7661E8aBF6eCA064b61F21

VITE_HERO_METADATA_PROXY=0x7603DdBcC4c998C7aB8DE7F91768c0ACd9CE2377
VITE_HERO_METADATA_IMPLEMENTATION=0x86a8649e9a1c533Cb7432C7067BDA5A5CD1c9128
VITE_HERO_METADATA_PROXY_ADMIN=0x909A58593C71F2F24d7661E8aBF6eCA064b61F21

VITE_HERO_PROXY=0xb86236BA8D6CAb15cf7972871f246F7C8693338b
VITE_HERO_IMPLEMENTATION=0x888C56Fce47919D84CB33b7DcE322839C4Fa2173
VITE_HERO_PROXY_ADMIN=0x909A58593C71F2F24d7661E8aBF6eCA064b61F21
```

### Deployment Steps Completed
1. Deployed all contracts:
   - ProxyAdmin
   - HeroNFT implementation and proxy
   - Hero implementation and proxy
   - HeroMetadata implementation and proxy

2. Initialized base data:
   - Set initial skills (Eagle Eye, Spider Sense, Holy Counter)
   - Registered NFT contract
   - Successfully minted first NFT (TokenId: 1)

### Full Deployment Log
```
Script ran successfully.

== Logs ==
ProxyAdmin deployed to: 0x909A58593C71F2F24d7661E8aBF6eCA064b61F21
HeroNFT Proxy deployed to: 0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c
Hero Proxy deployed to: 0xb86236BA8D6CAb15cf7972871f246F7C8693338b
HeroMetadata Proxy deployed to: 0x7603DdBcC4c998C7aB8DE7F91768c0ACd9CE2377
Registered NFT contract in Hero
Successfully minted first NFT
```

### Transaction Details
- Network: Optimism Sepolia
- Deployer: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA
- Total Gas Used: ~9.36M gas
- Estimated Cost: 0.00000936927101414 ETH

## Upgrade Attempt - Feb 9th 2024
尝试升级合约，添加版本变量。

### Hero Contract
- 新实现合约地址: 0x9fFAC59C6A3D49b0396F6A2F7e8012055838878c
- 升级失败，原因：权限问题

### 注意事项
1. 需要确保升级账户拥有 ProxyAdmin 的权限
2. 检查 ProxyAdmin 合约是否正确设置为代理合约的管理员
3. 验证所有合约的所有权关系

### 下一步行动
1. 检查当前账户权限
2. 验证合约所有权
3. 如有必要，转移所有权到正确的账户
