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
    "OPTIMISM_ETHERSCAN_API_KEY"
    "NODE_REGISTRY_ADDRESS"
    "STAKE_MANAGER_ADDRESS"
    "NODE_IP"
    "NODE_APIS"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set in .env.$NETWORK"
        exit 1
    fi
done

echo "Verifying NodeRegistry on $NETWORK..."
echo "Contract address: $NODE_REGISTRY_ADDRESS"
echo "StakeManager address: $STAKE_MANAGER_ADDRESS"
echo "Node IP: $NODE_IP"
echo "Node APIs: $NODE_APIS"

# 验证合约
forge verify-contract \
    "$NODE_REGISTRY_ADDRESS" \
    src/NodeRegistry.sol:NodeRegistry \
    --chain-id 11155420 \
    --verifier-url https://api-sepolia-optimistic.etherscan.io/api \
    --compiler-version v0.8.23+commit.f704f362 \
    --constructor-args $(cast abi-encode "constructor(address,string,string)" "$STAKE_MANAGER_ADDRESS" "$NODE_IP" "$NODE_APIS") \
    --watch \
    --etherscan-api-key "$OPTIMISM_ETHERSCAN_API_KEY"

if [ $? -eq 0 ]; then
    echo "Contract verification completed successfully!"
else
    echo "Error: Contract verification failed"
    exit 1
fi 