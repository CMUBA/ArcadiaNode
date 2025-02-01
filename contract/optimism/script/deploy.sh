#!/bin/bash

# 检查参数
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <network>"
    echo "Example: $0 optimism-testnet"
    exit 1
fi

NETWORK=$1

# 检查是否安装了 foundry
if ! command -v forge &> /dev/null; then
    echo "Error: foundry is not installed"
    echo "Please install it first: curl -L https://foundry.paradigm.xyz | bash"
    exit 1
fi

# 初始化依赖
echo "Initializing dependencies..."
if [ ! -d "lib/forge-std" ]; then
    forge install foundry-rs/forge-std --no-commit
fi

if [ ! -d "lib/openzeppelin-contracts" ]; then
    forge install OpenZeppelin/openzeppelin-contracts --no-commit
fi

# 加载环境变量
if [ -f ".env.$NETWORK" ]; then
    source .env.$NETWORK
else
    echo "Error: Environment file .env.$NETWORK not found"
    exit 1
fi

# 检查必要的环境变量
required_vars=(
    "DEPLOYER_PRIVATE_KEY"
    "RPC_URL"
    "NODE_PRIVATE_KEY"
    "NODE_IP"
    "NODE_APIS"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set in .env.$NETWORK"
        exit 1
    fi
done

# 为了兼容性，设置 PRIVATE_KEY 环境变量
export PRIVATE_KEY=$DEPLOYER_PRIVATE_KEY

echo "Deploying to $NETWORK..."

# 编译合约
echo "Compiling contracts..."
forge build --force

# 1. 部署 MushroomToken
echo "Step 1: Deploying MushroomToken contract..."
forge script script/MushroomToken.s.sol:MushroomTokenScript \
    --rpc-url $RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --broadcast

# 获取 MushroomToken 地址
STAKING_TOKEN_ADDRESS=$(grep "MushroomToken deployed at:" broadcast/MushroomToken.s.sol/**/run-latest.json | awk '{print $NF}' | tr -d '"')

if [ -z "$STAKING_TOKEN_ADDRESS" ]; then
    echo "Error: Failed to get MushroomToken address"
    exit 1
fi

# 导出 MushroomToken 地址
export STAKING_TOKEN_ADDRESS
echo "MushroomToken deployed at: $STAKING_TOKEN_ADDRESS"

# 2. 部署 StakeManager
echo "Step 2: Deploying StakeManager contract..."
forge script script/StakeManager.s.sol:StakeManagerScript \
    --rpc-url $RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --broadcast

# 获取 StakeManager 地址
STAKE_MANAGER_ADDRESS=$(grep "StakeManager deployed at:" broadcast/StakeManager.s.sol/**/run-latest.json | awk '{print $NF}' | tr -d '"')

if [ -z "$STAKE_MANAGER_ADDRESS" ]; then
    echo "Error: Failed to get StakeManager address"
    exit 1
fi

# 导出 StakeManager 地址
export STAKE_MANAGER_ADDRESS
echo "StakeManager deployed at: $STAKE_MANAGER_ADDRESS"

# 3. 部署 NodeRegistry
echo "Step 3: Deploying NodeRegistry contract..."
forge script script/NodeRegistry.s.sol:NodeRegistryScript \
    --rpc-url $RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --broadcast

# 获取 NodeRegistry 地址
NODE_REGISTRY_ADDRESS=$(grep "NodeRegistry deployed at:" broadcast/NodeRegistry.s.sol/**/run-latest.json | awk '{print $NF}' | tr -d '"')

if [ -z "$NODE_REGISTRY_ADDRESS" ]; then
    echo "Error: Failed to get NodeRegistry address"
    exit 1
fi

echo "NodeRegistry deployed at: $NODE_REGISTRY_ADDRESS"

# 保存部署信息
echo "Saving deployment information..."
cat > deployments.$NETWORK.json << EOF
{
    "network": "$NETWORK",
    "mushroomToken": "$STAKING_TOKEN_ADDRESS",
    "stakeManager": "$STAKE_MANAGER_ADDRESS",
    "nodeRegistry": "$NODE_REGISTRY_ADDRESS",
    "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
    "initialNode": {
        "address": "$(cast wallet address $NODE_PRIVATE_KEY)",
        "ip": "$NODE_IP",
        "apis": $NODE_APIS
    }
}
EOF

echo "Deployment completed successfully!"
echo "Deployment information saved to deployments.$NETWORK.json" 