#!/bin/bash

# 检查参数
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <network>"
    echo "Example: $0 optimism-sepolia"
    exit 1
fi

NETWORK=$1

# 加载环境变量
ENV_FILE=".env.$NETWORK"
if [ -f "$ENV_FILE" ]; then
    set -a
    source "$ENV_FILE"
    set +a
else
    echo "Error: Environment file $ENV_FILE not found"
    exit 1
fi

# 检查必要的环境变量
required_vars=(
    "DEPLOYER_PRIVATE_KEY"
    "RPC_URL"
    "NODE_PRIVATE_KEY"
    "NODE_IP"
    "NODE_APIS"
    "STAKE_MANAGER_ADDRESS"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set in .env.$NETWORK"
        exit 1
    fi
done

echo "Deploying NodeRegistry to $NETWORK..."
echo "Using StakeManager address: $STAKE_MANAGER_ADDRESS"

# 部署 NodeRegistry
forge script script/NodeRegistry.s.sol:NodeRegistryScript \
    --rpc-url $RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --broadcast \
    -vvvv

if [ $? -eq 0 ]; then
    echo "NodeRegistry deployment completed successfully!"
    
    # 获取部署的合约地址
    CONTRACT_ADDRESS=$(grep -A1 "== Logs ==" broadcast/NodeRegistry.s.sol/11155420/run-latest.json | tail -n1 | awk '{print $NF}' | tr -d '"')
    echo "Contract deployed at: $CONTRACT_ADDRESS"
    
    # 保存合约地址到环境变量文件
    if ! grep -q "NODE_REGISTRY_ADDRESS=" "$ENV_FILE"; then
        echo "NODE_REGISTRY_ADDRESS=$CONTRACT_ADDRESS" >> "$ENV_FILE"
    else
        sed -i '' "s/NODE_REGISTRY_ADDRESS=.*/NODE_REGISTRY_ADDRESS=$CONTRACT_ADDRESS/" "$ENV_FILE"
    fi
else
    echo "Error: NodeRegistry deployment failed"
    exit 1
fi 