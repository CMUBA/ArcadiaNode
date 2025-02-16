import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { showMessage } from '../utils/message.js';
import { config as envConfig } from '../config/index.js';

const NODE_URL = Network.DEVNET;
const config = new AptosConfig({ network: NODE_URL });
const aptos = new Aptos(config);

let account = null;

// Display contract information
function displayContractInfo() {
    const contractInfo = document.getElementById('contractInfo');
    if (contractInfo) {
        contractInfo.innerHTML = `
            <p>NFT Contract: ${envConfig.MOVE_HERO_NFT_ADDRESS}</p>
            <p>Hero Contract: ${envConfig.MOVE_HERO_ADDRESS}</p>
            <p>Metadata Contract: ${envConfig.MOVE_HERO_METADATA_ADDRESS}</p>
        `;
    }
}

// Connect wallet using Wallet Standard
async function connectWallet() {
    try {
        // Check if any wallet is available
        if (!('aptos' in window)) {
            throw new Error('Please install a wallet that supports the Aptos Wallet Standard');
        }

        // Use Wallet Standard to connect
        const walletStandard = window.aptos;
        const response = await walletStandard.connect();
        account = response.address;
        
        // Update UI
        document.getElementById('walletAddress').textContent = `Connected: ${account}`;
        showMessage('Wallet connected successfully');
        
        // Enable buttons that require wallet connection
        const walletButtons = document.querySelectorAll('.requires-wallet');
        for (const button of walletButtons) {
            button.disabled = false;
        }
        
        return true;
    } catch (error) {
        showMessage(`Error connecting wallet: ${error.message}`);
        return false;
    }
}

// Export functions to window object
Object.assign(window, {
    connectWallet,
    initializeContract,
    setDefaultPrices,
    setPriceConfig,
    mintNFT,
    batchMintNFT,
    loadNFTs,
    burnNFT,
    getDefaultPrices
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        displayContractInfo();
        if (window.aptos?.isConnected) {
            await connectWallet();
        }
        // 自动加载 NFTs
        await loadNFTs();
    } catch (error) {
        console.error('Error during page initialization:', error);
        showMessage(`Error during initialization: ${error.message}`);
    }
});

// Initialize contract
async function initializeContract() {
    try {
        const payload = {
            type: "entry_function_payload",
            function: "hero_nft::hero_nft::initialize",
            type_arguments: [],
            arguments: []
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('Contract initialized successfully');
    } catch (error) {
        showMessage(`Error initializing contract: ${error.message}`);
    }
}

// Set default prices
async function setDefaultPrices() {
    try {
        const nativePrice = Number.parseInt(document.getElementById('defaultNativePrice').value);
        const tokenPrice = Number.parseInt(document.getElementById('defaultTokenPrice').value);

        const payload = {
            type: "entry_function_payload",
            function: "hero_nft::hero_nft::set_default_prices",
            type_arguments: [],
            arguments: [nativePrice, tokenPrice]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('Default prices set successfully');
    } catch (error) {
        showMessage(`Error setting default prices: ${error.message}`);
    }
}

// Set price configuration
async function setPriceConfig() {
    try {
        const tokenId = Number.parseInt(document.getElementById('priceTokenId').value);
        const tokenName = document.getElementById('priceTokenName').value;
        const price = Number.parseInt(document.getElementById('tokenPrice').value);

        const payload = {
            type: "entry_function_payload",
            function: "hero_nft::hero_nft::set_price_config",
            type_arguments: [],
            arguments: [tokenId, tokenName, price]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('Price configuration set successfully');
    } catch (error) {
        showMessage(`Error setting price configuration: ${error.message}`);
    }
}

// Mint NFT
async function mintNFT(useToken = false) {
    try {
        const tokenId = Number.parseInt(document.getElementById('singleTokenId').value);
        const amount = Number.parseInt(document.getElementById('singleAmount').value);

        let payload;
        if (useToken) {
            // 使用 ArcadiaCoin 支付
            payload = {
                type: "entry_function_payload",
                function: `${envConfig.MOVE_HERO_NFT_ADDRESS}::hero_nft::mint_with_native`,
                type_arguments: [`${envConfig.MOVE_COIN_ADDRESS}::arcadia_coin::ArcadiaCoin`],
                arguments: [tokenId, amount]
            };
        } else {
            // 使用原生 APT 支付
            payload = {
                type: "entry_function_payload",
                function: `${envConfig.MOVE_HERO_NFT_ADDRESS}::hero_nft::mint_with_native`,
                type_arguments: ["0x1::aptos_coin::AptosCoin"],
                arguments: [tokenId, amount]
            };
        }

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('NFT minted successfully');
        loadNFTs();
    } catch (error) {
        showMessage(`Error minting NFT: ${error.message}`);
    }
}

// Batch mint NFTs
async function batchMintNFT(useToken = false) {
    try {
        const tokenIds = document.getElementById('batchTokenIds').value
            .split(',')
            .map(id => Number.parseInt(id.trim()));
        const amount = Number.parseInt(document.getElementById('batchAmount').value);

        let payload;
        if (useToken) {
            // 使用 ArcadiaCoin 支付
            payload = {
                type: "entry_function_payload",
                function: `${envConfig.MOVE_HERO_NFT_ADDRESS}::hero_nft::mint_batch_with_native`,
                type_arguments: [`${envConfig.MOVE_COIN_ADDRESS}::arcadia_coin::ArcadiaCoin`],
                arguments: [tokenIds, amount]
            };
        } else {
            // 使用原生 APT 支付
            payload = {
                type: "entry_function_payload",
                function: `${envConfig.MOVE_HERO_NFT_ADDRESS}::hero_nft::mint_batch_with_native`,
                type_arguments: ["0x1::aptos_coin::AptosCoin"],
                arguments: [tokenIds, amount]
            };
        }

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('NFTs minted successfully');
        loadNFTs();
    } catch (error) {
        showMessage(`Error batch minting NFTs: ${error.message}`);
    }
}

// Load NFTs
async function loadNFTs() {
    try {
        if (!account) {
            showMessage('Please connect wallet first');
            return;
        }

        const resources = await aptos.getAccountResources({
            accountAddress: account,
        });

        const nftResource = resources?.find(r => 
            r.type === `${envConfig.MOVE_HERO_NFT_ADDRESS}::hero_nft::TokenStore`
        );

        const nftList = document.getElementById('nftList');
        nftList.innerHTML = '';

        if (nftResource?.data?.tokens) {
            for (const [tokenId, amount] of Object.entries(nftResource.data.tokens)) {
                const nftElement = document.createElement('div');
                nftElement.className = 'bg-white p-4 rounded shadow';
                nftElement.innerHTML = `
                    <h3 class="text-lg font-bold">Hero NFT</h3>
                    <p>Token ID: ${tokenId}</p>
                    <p>Amount: ${amount}</p>
                    <button onclick="burnNFT('${tokenId}')" class="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                        Burn NFT
                    </button>
                `;
                nftList.appendChild(nftElement);
            }
        }

        if (nftList.children.length === 0) {
            nftList.innerHTML = '<p class="text-gray-500">No NFTs found</p>';
        }
    } catch (error) {
        showMessage(`Error loading NFTs: ${error.message}`);
    }
}

// Burn NFT
async function burnNFT(tokenId) {
    try {
        const payload = {
            type: "entry_function_payload",
            function: "hero_nft::hero_nft::burn",
            type_arguments: [],
            arguments: [tokenId]
        };

        const response = await window.aptos.signAndSubmitTransaction(payload);
        await aptos.waitForTransaction({ hash: response.hash });
        showMessage('NFT burned successfully');
        loadNFTs();
    } catch (error) {
        showMessage(`Error burning NFT: ${error.message}`);
    }
}

// Get default prices
async function getDefaultPrices() {
    try {
        const tokenId = Number.parseInt(document.getElementById('queryTokenId').value);
        
        const resource = await aptos.getAccountResource({
            accountAddress: envConfig.MOVE_HERO_NFT_ADDRESS,
            resourceType: `${envConfig.MOVE_HERO_NFT_ADDRESS}::hero_nft::TokenPriceConfig`
        });

        if (resource && resource.data) {
            const priceConfig = resource.data;
            document.getElementById('currentNativePrice').textContent = `Default Native Price: ${priceConfig.native_price} APT`;
            document.getElementById('currentTokenPrice').textContent = `Default Token Price: ${priceConfig.token_price}`;
        } else {
            showMessage('Price configuration not found');
        }
    } catch (error) {
        showMessage(`Error getting default prices: ${error.message}`);
    }
}

// Query NFT price
async function queryNFTPrice() {
    try {
        const contractAddress = document.getElementById('contractAddress').value;
        const tokenId = Number.parseInt(document.getElementById('tokenId').value);
        
        if (!contractAddress || isNaN(tokenId)) {
            throw new Error('Please enter valid contract address and token ID');
        }

        const resource = await aptos.getAccountResource({
            accountAddress: contractAddress,
            resourceType: `${contractAddress}::hero_nft::CollectionData`
        });

        if (resource?.data) {
            const priceInfo = document.getElementById('priceInfo');
            priceInfo.innerHTML = `
                <p>Default Native Price: ${resource.data.default_native_price} APT</p>
                <p>Default Token Price: ${resource.data.default_token_price} ARC</p>
                <p>Default Token Type: ${resource.data.default_token_type}</p>
            `;
        } else {
            showMessage('Price configuration not found');
        }
    } catch (error) {
        showMessage(`Error querying price: ${error.message}`);
    }
} 
  [1754954] → new HeroNFT@0x776f3f1137bc5f7363EE2c25116546661d2B8131
    ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    └─ ← [Return] 8178 bytes of code

  [1087396] → new HeroMetadata@0xdB9E1B0Bb44cAA4b8B1073eAcfDd3FF1EA8d1C22
    ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    └─ ← [Return] 5313 bytes of code

  [1207516] → new HeroV5@0x5B34103d15C848b9a58e311f1bC6D913395AcB1C
    ├─ emit OwnershipTransferred(previousOwner: 0x0000000000000000000000000000000000000000, newOwner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA)
    └─ ← [Return] 5913 bytes of code

  [51499] HeroMetadata::setSkill(0, 0, 1, "Eagle Eye", 2, true)
    ├─ emit SkillUpdated(seasonId: 0, skillId: 0, level: 1, name: "Eagle Eye", points: 2)
    └─ ← [Stop]

  [51499] HeroMetadata::setSkill(0, 1, 1, "Spider Sense", 1, true)
    ├─ emit SkillUpdated(seasonId: 0, skillId: 1, level: 1, name: "Spider Sense", points: 1)
    └─ ← [Stop]

  [51499] HeroMetadata::setSkill(0, 2, 1, "Holy Counter", 1, true)
    ├─ emit SkillUpdated(seasonId: 0, skillId: 2, level: 1, name: "Holy Counter", points: 1)
    └─ ← [Stop]

  [120632] HeroMetadata::setRace(0, [10, 10, 10, 10], "Human race with balanced attributes", true)
    ├─ emit RaceUpdated(raceId: 0, baseAttributes: [10, 10, 10, 10], description: "Human race with balanced attributes")
    └─ ← [Stop]

  [146202] HeroMetadata::setClass(0, [12, 15, 20, 18], [2, 3, 4, 3], "Warrior class focused on strength", true)
    ├─ emit ClassUpdated(classId: 0, baseAttributes: [12, 15, 20, 18], growthRates: [2, 3, 4, 3], description: "Warrior class focused on strength")
    └─ ← [Stop]

  [93119] HeroV5::registerNFT(HeroNFT: [0x776f3f1137bc5f7363EE2c25116546661d2B8131], true)
    ├─ emit NFTRegistered(nftContract: HeroNFT: [0x776f3f1137bc5f7363EE2c25116546661d2B8131], isOfficial: true)
    └─ ← [Return]

  [76796] HeroNFT::mint{value: 10000000000000000}(0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA, 1)
    ├─ emit Transfer(from: 0x0000000000000000000000000000000000000000, to: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA, tokenId: 1)
    ├─ emit NFTMinted(to: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA, tokenId: 1, paymentToken: 0x0000000000000000000000000000000000000000, price: 10000000000000000 [1e16], timestamp: 1739327556 [1.739e9])
    └─ ← [Return]

  [165703] HeroV5::createHero(HeroNFT: [0x776f3f1137bc5f7363EE2c25116546661d2B8131], 1, "Genesis Hero", 0, 0)
    ├─ emit HeroCreated(nftContract: HeroNFT: [0x776f3f1137bc5f7363EE2c25116546661d2B8131], tokenId: 1, name: "Genesis Hero")
    └─ ← [Return]


==========================

Chain 11155420

Estimated gas price: 0.001000502 gwei

Estimated total gas used for script: 7202715

Estimated amount required: 0.00000720633076293 ETH

==========================

##### optimism-sepolia
✅  [Success]Hash: 0xe41e4ccad3853cb99b118530e4b014f4adfb6169a38a1fd00b4976c1d4e26a2b
Block: 23762512
Paid: 0.000000078714752445 ETH (78695 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xdc562332678317898d5abf947951a666cb1905d02e623acedb4ec8b4e705ac88
Contract Address: 0x776f3f1137bc5f7363EE2c25116546661d2B8131
Block: 23762512
Paid: 0.00000195470050671 ETH (1954210 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xa37541386bd69a1b3c1bacbc35f2ea62bf66d2a678e0640b4a6e8c092dee98c9
Block: 23762512
Paid: 0.00000014351601348 ETH (143480 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xf988b3f60221fbe7093d82d7f22a7482aa05307e3150282df6a1f38acad8fd38
Contract Address: 0xdB9E1B0Bb44cAA4b8B1073eAcfDd3FF1EA8d1C22
Block: 23762512
Paid: 0.000001225611551304 ETH (1225304 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x5874f1f37ae56d68bdcc58193b51ecb7b11fb648a43f228c1635c751e19dc17e
Block: 23762512
Paid: 0.000000073773512505 ETH (73755 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x908b882da6b990c928dc068ab14e40b54e5aa3e729162f41db1ef7972720c231
Block: 23762512
Paid: 0.000000073821524553 ETH (73803 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xf08eefc80284dacba0ffe0e17067cc254ab293ca008926dabaa4dfcc781d1a6f
Block: 23762512
Paid: 0.000000073821524553 ETH (73803 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0xb9a0feb3c4c16af58b523e7ba139cf513764dfee2b2bab65245bd7cdfe6fc6c7
Block: 23762512
Paid: 0.000000188130208833 ETH (188083 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x9164a40f1b9add0724c3be6e47bab2001d401a3bf5148c42628f5b6500caf167
Contract Address: 0x5B34103d15C848b9a58e311f1bC6D913395AcB1C
Block: 23762512
Paid: 0.000001356768463428 ETH (1356428 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x268d66f5ad6871aac05cfbea5e992450c266582a06989388278b0e9741873aa2
Block: 23762512
Paid: 0.000000169640569098 ETH (169598 gas * 0.001000251 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x581a4a468ace6899f2bb4d7704c4ed7f6c17fd006cfdecaebf844e7914273f36
Block: 23762512
Paid: 0.000000114719787441 ETH (114691 gas * 0.001000251 gwei)

✅ Sequence #1 on optimism-sepolia | Total Paid: 0.00000545321841435 ETH (5451850 gas * avg 0.001000251 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/broadcast/DeployAndInit.s.sol/11155420/run-latest.json

Sensitive values saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/cache/DeployAndInit.s.sol/11155420/run-latest.json

#### 概述部署结果

成功部署了 3 个核心合约：
HeroNFT: 0x776f3f1137bc5f7363EE2c25116546661d2B8131
HeroMetadata: 0xdB9E1B0Bb44cAA4b8B1073eAcfDd3FF1EA8d1C22
HeroV5: 0x5B34103d15C848b9a58e311f1bC6D913395AcB1C
初始化操作成功完成：
设置了 3 个初始技能：Eagle Eye(2 点)、Spider Sense(1 点)、Holy Counter(1 点)
设置了人类种族属性：[10,10,10,10]
设置了战士职业属性：[12,15,20,18] 和成长率：[2,3,4,3]
注册了 HeroNFT 为官方 NFT 合约
为部署者铸造了第一个 NFT(ID: 1) 并创建了英雄记录


## 2025-02-12

### Contract Deployments
- HeroNFT: 0x776f3f1137bc5f7363EE2c25116546661d2B8131
- HeroMetadata: 0xdB9E1B0Bb44cAA4b8B1073eAcfDd3FF1EA8d1C22
- HeroV5: 0x5B34103d15C848b9a58e311f1bC6D913395AcB1C

### Updates
- Updated HeroNFT payment settings
  - Set ERC20 token (0xBda48255DA1ed61a209641144Dd24696926aF3F0) as payment token
  - Updated native price to 0.01 ETH
  - Updated token price to 100 tokens

### Initial Setup
- Initialized metadata (skills, race, class)
- Registered NFT contract in Hero system
- Minted first NFT (ID: 1) to deployer
- Created first hero record


#### NFT add erc20 contract
 source .env&&forge script script/UpdateNFTPayment.s.sol:UpdateNFTPaymentScript --rpc-url https://opt-sepolia.g.alchemy.com/v2/IIY_LZOlEuy66agzhxpYexmEaHuMskl- --broadcast
[⠢] Compiling...
No files changed, compilation skipped
Script ran successfully.

== Logs ==

=== Network Information ===
  Chain ID: 11155420

=== Pre-update Checks ===
  Deployer address: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA
  NFT contract address: 0x776f3f1137bc5f7363EE2c25116546661d2B8131
  Current block: 23764914
  Current timestamp: 1739332368
  Contract code size: 8178
  Using RPC URL: https://opt-sepolia.g.alchemy.com/v2/IIY_LZOlEuy66agzhxpYexmEaHuMskl-
  Contract owner: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA
  Deployer address: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA
  Successfully set default payment token
  Successfully set default prices

=== NFT Payment Update Information ===
  HeroNFT Address: 0x776f3f1137bc5f7363EE2c25116546661d2B8131
  New Payment Token: 0xBda48255DA1ed61a209641144Dd24696926aF3F0
  Native Price: 0 ETH
  Token Price: 100 Tokens

## Setting up 1 EVM.

==========================

Chain 11155420

Estimated gas price: 0.001005503 gwei

Estimated total gas used for script: 109796

Estimated amount required: 0.000000110400207388 ETH

==========================

##### optimism-sepolia
✅  [Success]Hash: 0x9341581258c0c961f64b222ff2689e999c1c1ccab9cbb2696cf25493ee69e7b7
Block: 23764923
Paid: 0.000000046967383944 ETH (46722 gas * 0.001005252 gwei)


##### optimism-sepolia
✅  [Success]Hash: 0x65dc51584a61a864a81fe68298e403ee1f9e4067de27bfededda2706ee576c4b
Block: 23764924
Paid: 0.000000028501909956 ETH (28353 gas * 0.001005252 gwei)

✅ Sequence #1 on optimism-sepolia | Total Paid: 0.0000000754692939 ETH (75075 gas * avg 0.001005252 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/broadcast/UpdateNFTPayment.s.sol/11155420/run-latest.json

Sensitive values saved to: /Users/jason/Dev/Community/move/ArcadiaNode/contract/hero/cache/UpdateNFTPayment.s.sol/11155420/run-latest.json



hero-test 完整流程如下：

用户点击连接钱包
连接成功后自动加载注册的 NFT 合约列表
用户可以点击每个合约的 "Load NFTs" 按钮
加载 NFT 时会检查：
用户是否拥有该合约的 NFT
每个 NFT 是否已注册英雄
对于未注册英雄的 NFT：
显示 "Create Hero" 按钮
点击后自动填充创建英雄表单
对于已注册英雄的 NFT：
显示英雄信息
提供查看详情的按钮


页面加载流程：
连接钱包后，首先调用 hero.getRegisteredNFTs() 获取所有已注册的 NFT 合约列表
显示每个注册的 NFT 合约地址，并为每个合约添加 "Load NFTs" 按钮
用户可以点击按钮查看具体合约下拥有的 NFT
NFT 加载流程：
使用 balanceOf 检查用户在该合约下的 NFT 数量
遍历可能的 token ID（设置了合理的上限），使用 ownerOf 检查所有权
对于用户拥有的每个 NFT，调用 hero.getHeroInfo 检查是否已创建英雄
根据是否已创建英雄显示不同的界面：
已创建：显示英雄信息（名称、等级等）
未创建：显示 "Create Hero" 按钮


hero-test 页面的逻辑：
1. 点击连接钱包，获得登录钱包地址，然后先通过 ABI 查询 hero 合约已经注册了的 NFT 合约列表，逐个显示。
2. 在每个 NFT 合约行结尾，通过登录钱包地址、NFT 合约地址来查询是否在 Hero 合约注册或记录。
3. 如果拥有 hero 记录，则显示 hero 信息，没有则提示可以显示注册 hero，点击传递此参数给 create hero。
4. 我们确认 hero create 测试逻辑已经实现，可以正常创建英雄（参考 DeployAndInit.s.sol 脚本）
5. 历史经验：使用 getRegisteredNFTs 合约接口获取注册的 NFT 合约列表
使用 ERC721 标准接口 balanceOf 和 ownerOf 通过便利前 20 nft id 获取用户拥有的 NFT（未来用户登录会携带合约和 id）
使用 getHeroInfo 接口检查 NFT 是否已注册英雄
这样的实现更加直接和高效，不需要查询区块历史。
这样的实现避免了使用 tokenOfOwnerByIndex，而是采用了更通用的方式来查找用户拥有的 NFT。虽然这种方式在 token ID 范围很大时可能不够高效，但对于测试环境来说是可以接受的。
6. 1. 改造所有链接钱包 button：除了获取登陆地址等原来功能外，增加查询 hero 合约，获得此钱包注册过的 nft 合约和 id，返回供后面业务使用
2. http://localhost:3008/pages/hero-test.html，点击连接钱包，先获得了在hero合约注册过的nft合约和id，和查询登陆账户拥有的nft列表做对比，已经注册了hero的nft，不可以显示create hero button，而是显示 hero 记录信息；没有注册的才显示 cteate hero


A. ArcadiaCoin 部署和初始化
1. 使用提供的测试账户部署 ArcadiaCoin 合约
2. 初始化 ArcadiaCoin (调用 initialize)
3. 给测试账户铸造 100,000 ARC (调用 mint)

B. NFT 合约初始化
1. 使用 ArcadiaCoin 地址作为参数初始化 NFT 合约
2. 设置默认价格配置：
   - 设置原生代币 (APT) 价格
   - 设置 ARC 代币价格
   - 设置默认支付代币为 ARC
   - 使用 APT 设置价格和购买 nft

C. Hero NFT 购买测试
1. 使用 ARC 代币购买单个 NFT:
   - 检查 ARC 余额
   - 授权 NFT 合约使用 ARC
   - 调用 mintWithToken 购买 NFT
   
2. 批量购买测试：
   - 使用 ARC 代币批量购买多个 NFT
   - 验证 NFT 所有权

D. Hero 合约交互
1. 注册新购买的 NFT 到 Hero 合约
2. 创建 Hero 记录：
   - 设置 Hero 名称
   - 选择种族和职业
   - 调用 createHero
3. 验证 Hero 数据

### 2025-02-15

#### Move Contract Deployments

1. 部署步骤：
   ```bash
   # 1. 编译合约
   cd contract/aptos
   aptos move compile

部署 ArcadiaCoin 合约：
   aptos move publish --named-addresses arcadia_coin=53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8

   ```

    Transaction submitted: https://explorer.aptoslabs.com/txn/0x74f6cd4cf68434570c09c6acdfbb96c1945d9b70eadc70d688218650ba9cdf54?network=devnet
    {
      "Result": {
        "transaction_hash": "0x74f6cd4cf68434570c09c6acdfbb96c1945d9b70eadc70d688218650ba9cdf54",
        "gas_used": 102,
        "gas_unit_price": 100,
        "sender": "53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8",
        "sequence_number": 6,
        "success": true,
        "timestamp_us": 1739594013521558,
        "version": 15351603,
        "vm_status": "Executed successfully"
      }
    }
    ```

初始化
```
source .env && aptos move run --function-id $MOVE_COIN_ADDRESS::arcadia_coin::initialize --args 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8 --profile default

aptos move run --function-id 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8::arcadia_coin::initialize --args address:53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8 --profile default
{
  "Error": "Simulation failed with status: NUMBER_OF_ARGUMENTS_MISMATCH"
}

aptos move run --function-id 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8::arcadia_coin::initialize --signer 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8 --profile default


aptos move run --function-id 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8::arcadia_coin::initialize --profile default

aptos move run --function-id 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8::arcadia_coin::mint --args u64:2100000000000000 address:53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8 --profile default

```
   
   # 2. 部署 HeroNFT 合约
   aptos move publish --named-addresses hero_nft=53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8

```
Transaction submitted: https://explorer.aptoslabs.com/txn/0x79e1ca51d160856df991bbadf0cec571121b6ab615b3774d69ee0f88eec75660?network=devnet
{
  "Result": {
    "transaction_hash": "0x79e1ca51d160856df991bbadf0cec571121b6ab615b3774d69ee0f88eec75660",
    "gas_used": 8155,
    "gas_unit_price": 100,
    "sender": "53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8",
    "sequence_number": 0,
    "success": true,
    "timestamp_us": 1739592692748471,
    "version": 15068966,
    "vm_status": "Executed successfully"
  }
}

```
   
   # 3. 部署 HeroMetadata 合约
   aptos move publish --named-addresses hero_metadata=53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8

   ```

Transaction submitted: https://explorer.aptoslabs.com/txn/0xdf9e1391aa81208bf18e23416a0b07267242e5c368f6e7f459074e6fd6228d3c?network=devnet
{
  "Result": {
    "transaction_hash": "0xdf9e1391aa81208bf18e23416a0b07267242e5c368f6e7f459074e6fd6228d3c",
    "gas_used": 102,
    "gas_unit_price": 100,
    "sender": "53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8",
    "sequence_number": 1,
    "success": true,
    "timestamp_us": 1739592751250940,
    "version": 15081446,
    "vm_status": "Executed successfully"
  }
}

   ```
   
   # 4. 部署 Hero 合约
   aptos move publish --named-addresses hero=53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8
   ```

Transaction submitted: https://explorer.aptoslabs.com/txn/0x36b6949f5fb301fb27ec8dcea9e60b0ca2690346bc7717692dd6fb2545388b0f?network=devnet
{
  "Result": {
    "transaction_hash": "0x36b6949f5fb301fb27ec8dcea9e60b0ca2690346bc7717692dd6fb2545388b0f",
    "gas_used": 102,
    "gas_unit_price": 100,
    "sender": "53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8",
    "sequence_number": 2,
    "success": true,
    "timestamp_us": 1739592826297674,
    "version": 15097889,
    "vm_status": "Executed successfully"
  }
}
   ```

1. 初始化步骤：
   ```bash
   # 1. 初始化 HeroNFT
source .env && aptos move run \
    --function-id $MOVE_HERO_NFT_ADDRESS::hero_nft::initialize \
    --profile default

    ```

Transaction submitted: https://explorer.aptoslabs.com/txn/0x050aec87c1b8c0307d736ab4bf2aadeb44e6c9b3ba085011fbbc1eebe82a8ed5?network=devnet
{
  "Result": {
    "transaction_hash": "0x050aec87c1b8c0307d736ab4bf2aadeb44e6c9b3ba085011fbbc1eebe82a8ed5",
    "gas_used": 460,
    "gas_unit_price": 100,
    "sender": "53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8",
    "sequence_number": 3,
    "success": true,
    "timestamp_us": 1739593531849316,
    "version": 15249386,
    "vm_status": "Executed successfully"
  }
}
    
    ```
    
   
   # 2. 初始化 HeroMetadata
   source .env && aptos move run --function-id $MOVE_HERO_METADATA_ADDRESS::metadata::initialize --profile default

   ```

    Transaction submitted: https://explorer.aptoslabs.com/txn/0xc226580b6117e58b6cb6446ff7a82ddbca56eb4326c805ad592f7ea473c967fc?network=devnet
    {
      "Result": {
        "transaction_hash": "0xc226580b6117e58b6cb6446ff7a82ddbca56eb4326c805ad592f7ea473c967fc",
        "gas_used": 441,
        "gas_unit_price": 100,
        "sender": "53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8",
        "sequence_number": 4,
        "success": true,
        "timestamp_us": 1739593566790539,
        "version": 15257145,
        "vm_status": "Executed successfully"
      }
    }
       
    ```
   
   
   # 3. 初始化 Hero
   source .env && aptos move run --function-id $MOVE_HERO_ADDRESS::hero::initialize --profile default
   ```
    Transaction submitted: https://explorer.aptoslabs.com/txn/0x48838480c843d81a636027e973b72f47140d248260627b1ccf2b1075f3495395?network=devnet
    {
      "Result": {
        "transaction_hash": "0x48838480c843d81a636027e973b72f47140d248260627b1ccf2b1075f3495395",
        "gas_used": 5,
        "gas_unit_price": 100,
        "sender": "53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8",
        "sequence_number": 5,
        "success": true,
        "timestamp_us": 1739593605815544,
        "version": 15265469,
        "vm_status": "Executed successfully"
      }
    }
    ```

3. 合约地址：
   ```
   MOVE_HERO_NFT_ADDRESS=0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8
   MOVE_HERO_METADATA_ADDRESS=0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8
   MOVE_HERO_ADDRESS=0x53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8
   ```

4. 初始化数据：
   - 添加了基础种族：Human
   - 添加了基础职业：Warrior
   - 添加了初始技能：Slash
   - 注册了 HeroNFT 为官方 NFT
   - 创建了第一个 Hero NFT‘
   - 
   - 
5. 配置检查
   aptos move list --account 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8                                  ↵
package hero
  upgrade_policy: compatible
  upgrade_number: 3
  source_digest: 5A5BD4A58C73B409A2F804B06CB0645B159149E89B1D8AA65A8F2979D1C55951
  modules: arcadia_coin, metadata, hero, hero_nft
{
  "Result": "list succeeded"
}



==========
# 1. 发布合约
cd contract/aptos
aptos move publish --profile default

# 2. 初始化 ArcadiaCoin
aptos move run \
    --function-id 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8::arcadia_coin::initialize \
    --profile default

# 3. 注册账户接收 ArcadiaCoin
aptos move run \
    --function-id 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8::arcadia_coin::register \
    --profile default

# 4. 铸造代币
aptos move run \
    --function-id 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8::arcadia_coin::mint \
    --args u64:2100000000000000 address:53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8 \
    --profile default

1 为何还报 no entry：aptos move run \                                                                                                            1 ↵
>     --function-id 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8::arcadia_coin::initialize \
>     --profile default
{
  "Error": "Simulation failed with status: EXECUTE_ENTRY_FUNCTION_CALLED_ON_NON_ENTRY_FUNCTION"
}

2. move-nft 页面报错：
index.js:3 Uncaught SyntaxError: The requested module '/config/index.js?t=1739613038589' does not provide an export named 'config' (at index.js:3:10)Understand this errorAI

3. http://localhost:3008/pages/move-nft.html页面的Price Settings 区域增加一个获取 input tokenid 的两种 token 的 price 功能
1. 
1. 
1. 
1. 
1

-------------
检查已部署的模块：
 aptos move list --account 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8

package hero
  upgrade_policy: compatible
  upgrade_number: 3
  source_digest: 5A5BD4A58C73B409A2F804B06CB0645B159149E89B1D8AA65A8F2979D1C55951
  modules: arcadia_coin, metadata, hero, hero_nft
{
  "Result": "list succeeded"
}

初始化：
   aptos move run --function-id 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8::arcadia_coin::initialize --args address:53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8 --profile default


再次部署
aptos move publish --named-addresses hero=53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8                  2 ↵
Compiling, may take a little while to download git dependencies...
UPDATING GIT DEPENDENCY https://github.com/aptos-labs/aptos-core.git
UPDATING GIT DEPENDENCY https://github.com/aptos-labs/aptos-core.git
INCLUDING DEPENDENCY AptosFramework
INCLUDING DEPENDENCY AptosStdlib
INCLUDING DEPENDENCY AptosToken
INCLUDING DEPENDENCY MoveStdlib
BUILDING hero
package size 14830 bytes
Do you want to submit a transaction for a range of [10200 - 15300] Octas at a gas unit price of 100 Octas? [yes/no] >
yes
Transaction submitted: https://explorer.aptoslabs.com/txn/0xfe395bbdba94aa07e5af3df3cd694f7a73126c04dcba62f97095a0ac47d7605e?network=devnet
{
  "Result": {
    "transaction_hash": "0xfe395bbdba94aa07e5af3df3cd694f7a73126c04dcba62f97095a0ac47d7605e",
    "gas_used": 102,
    "gas_unit_price": 100,
    "sender": "53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8",
    "sequence_number": 7,
    "success": true,
    "timestamp_us": 1739676938772407,
    "version": 25370325,
    "vm_status": "Executed successfully"
  }
}

初始化 arcadia coin
aptos move run --function-id 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8::arcadia_coin::initialize --profile default
Do you want to submit a transaction for a range of [92000 - 138000] Octas at a gas unit price of 100 Octas? [yes/no] >
yes
Transaction submitted: https://explorer.aptoslabs.com/txn/0xfb23ad928c89e0d1cad2f5ad7101de4180d178a7832137e574c7c79e67c5044f?network=devnet
{
  "Result": {
    "transaction_hash": "0xfb23ad928c89e0d1cad2f5ad7101de4180d178a7832137e574c7c79e67c5044f",
    "gas_used": 920,
    "gas_unit_price": 100,
    "sender": "53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8",
    "sequence_number": 8,
    "success": true,
    "timestamp_us": 1739677005381588,
    "version": 25384307,
    "vm_status": "Executed successfully"
  }
}

注册 register account in arcadia coin:
aptos move run --function-id 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8::arcadia_coin::register --profile default
Do you want to submit a transaction for a range of [50600 - 75900] Octas at a gas unit price of 100 Octas? [yes/no] >
yes
Transaction submitted: https://explorer.aptoslabs.com/txn/0xf510e5626668ad7c574760beb6c769d94c5acef077c48de32e3e41afbddf33ba?network=devnet
{
  "Result": {
    "transaction_hash": "0xf510e5626668ad7c574760beb6c769d94c5acef077c48de32e3e41afbddf33ba",
    "gas_used": 506,
    "gas_unit_price": 100,
    "sender": "53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8",
    "sequence_number": 9,
    "success": true,
    "timestamp_us": 1739677073700682,
    "version": 25398469,
    "vm_status": "Executed successfully"
  }
}

mint 代币：
aptos move run --function-id 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8::arcadia_coin::mint --args u64:2100000000000000 address:53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8 --profile default
Do you want to submit a transaction for a range of [800 - 1200] Octas at a gas unit price of 100 Octas? [yes/no] >
yes
Transaction submitted: https://explorer.aptoslabs.com/txn/0xa7b2641f692d9b8f3354c62acdb5561fd62d1d5889a969083061caa7b784ee24?network=devnet
{
  "Result": {
    "transaction_hash": "0xa7b2641f692d9b8f3354c62acdb5561fd62d1d5889a969083061caa7b784ee24",
    "gas_used": 8,
    "gas_unit_price": 100,
    "sender": "53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8",
    "sequence_number": 10,
    "success": true,
    "timestamp_us": 1739677136066255,
    "version": 25411359,
    "vm_status": "Executed successfully"
  }
}



根据查询结果，我可以为你总结当前合约的初始化状态：

ArcadiaCoin 状态：
✅ 已初始化
✅ 已注册账户
✅ 已铸造代币（余额：2,100,000,000,000,000，即 21,000,000 个代币考虑 8 位小数）
✅ Capabilities 资源已存在（mint_cap, burn_cap, freeze_cap）
HeroNFT 状态：
✅ 已初始化（CollectionData 资源存在）
默认原生价格：1,000,000
默认代币价格：1,000,000
当前注册的 NFTs：[]
Metadata 状态：
✅ 已初始化（MetadataStore 资源存在）
当前种族列表：[]
当前职业列表：[]
当前技能列表：[]
所以，所有合约都已经正确初始化了。这就是为什么当你尝试再次初始化时会收到错误，因为这些资源已经存在于合约地址中。

补充一个初始化：
 aptos move run --function-id '53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8::hero_nft::set_default_token_type' --args 'string:ArcadiaCoin'
Do you want to submit a transaction for a range of [900 - 1300] Octas at a gas unit price of 100 Octas? [yes/no] >
yes
Transaction submitted: https://explorer.aptoslabs.com/txn/0x23f732d6c12da78803b4cb2bab87165437410bfde554b549f6c420b755f632a6?network=devnet
{
  "Result": {
    "transaction_hash": "0x23f732d6c12da78803b4cb2bab87165437410bfde554b549f6c420b755f632a6",
    "gas_used": 9,
    "gas_unit_price": 100,
    "sender": "53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8",
    "sequence_number": 13,
    "success": true,
    "timestamp_us": 1739678264218192,
    "version": 25570034,
    "vm_status": "Executed successfully"
  }
}

----

1.move 合约四个已经完成编译和测试、发布，可以查询 resource 细节：
 aptos move list --account 53f7e4ab7f52b7030d5a53f343eb37c64d9a36838c5e545542e21dc7b8b4bfd8

package hero
  upgrade_policy: compatible
  upgrade_number: 3
  source_digest: 5A5BD4A58C73B409A2F804B06CB0645B159149E89B1D8AA65A8F2979D1C55951
  modules: arcadia_coin, metadata, hero, hero_nft
{
  "Result": "list succeeded"
}

2.已经完成了三个页面：move-nft.html,move-hero.html,move-metadata.html，借鉴的是 client/src/pages/hero-test 等页面

3. move-nft.html,：
- 需要在 top menu 下新增一个 hero 合约查询，首先查询 hero 合约接受的 nft 合约列表，显示出来
- 移动 NFT Minting 到第一行，同时我要确认，hero 合约是支持新增其他 nft 合约注册的，请检查合约接口
- 需要增加一个区域在第二行，然后查询指定合约和 token id 的价格（native token 和其他 token 价格）

4. move-hero.html：
- 借鉴 move-nft 页面，top menu 增加链接：Home
Move Hero
Move Metadata
Move NFT
- 借鉴 move-nft 页面，链接 petra 钱包，然后进行 hero 合约的所有接口测试交互，请帮助我参考 hero 合约和整体设计完成页面开发，包括对应的 js 文件，借鉴 move-nft.js

5.move-metadata.html：
- 借鉴 move-nft 页面，top menu 增加链接：Home
Move Hero
Move Metadata
Move NFT
- 借鉴 move-nft 页面，链接 petra 钱包，然后进行 metadata 合约的所有接口测试交互，请帮助我参考 metadata 合约和整体设计完成页面开发，包括对应的 js 文件，借鉴 move-nft.js

6.相关参考信息：

A. ArcadiaCoin 部署和初始化
1. 使用提供的测试账户部署 ArcadiaCoin 合约
2. 初始化 ArcadiaCoin (调用 initialize)
3. 给测试账户铸造 100,000 ARC (调用 mint)

B. NFT 合约初始化
1. 使用 ArcadiaCoin 地址作为参数初始化 NFT 合约
2. 设置默认价格配置：
   - 设置原生代币 (APT) 价格
   - 设置 ARC 代币价格
   - 设置默认支付代币为 ARC
   - 使用 APT 设置价格和购买 nft

C. NFT 购买测试
1. 使用 ARC 代币购买单个 NFT:
   - 检查 ARC 余额
   - 授权 NFT 合约使用 ARC
   - 调用 mintWithToken 购买 NFT
2. 使用 APT 购买 NFT:
   - 检查 APT 余额
   - 调用 mintWithToken 购买 NFT
2. 批量购买测试：
   - 使用 ARC 代币批量购买多个 NFT
   - 验证 NFT 所有权

D. Hero 合约交互
1. 注册新购买的 NFT 到 Hero 合约
2. 创建 Hero 记录：
   - 设置 Hero 名称
   - 选择种族和职业
   - 调用 createHero
3. 根据 NFT 和 id，查询和验证 Hero 数据

7.其他错误：
http://localhost:3008/pages/nft-contract.html
此页面我修改引用，import config from '../config/hero.js';替换了../config/index.js，为何浏览器还在寻找 index.js，如何每次启动强制刷新缓存？有其他解决思路么？


