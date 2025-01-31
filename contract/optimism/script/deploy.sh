#!/bin/bash

# 加载环境变量
source .env

# 检查必要的环境变量
if [ -z "$PRIVATE_KEY" ]; then
    echo "Error: PRIVATE_KEY not set in .env file"
    exit 1
fi

if [ -z "$STAKE_MANAGER_ADDRESS" ]; then
    echo "Error: STAKE_MANAGER_ADDRESS not set in .env file"
    exit 1
fi

# 设置网络参数
NETWORK=$1
if [ -z "$NETWORK" ]; then
    echo "Usage: ./deploy.sh <network>"
    echo "Available networks: optimism-mainnet, optimism-testnet"
    exit 1
fi

# 根据网络选择RPC URL
case $NETWORK in
    "optimism-mainnet")
        RPC_URL=$OPTIMISM_RPC_URL
        VERIFY_KEY=$OPTIMISM_ETHERSCAN_API_KEY
        ;;
    "optimism-testnet")
        RPC_URL=$OPTIMISM_TESTNET_RPC_URL
        VERIFY_KEY=$OPTIMISM_ETHERSCAN_API_KEY
        ;;
    *)
        echo "Unsupported network: $NETWORK"
        exit 1
        ;;
esac

# 检查RPC URL
if [ -z "$RPC_URL" ]; then
    echo "Error: RPC URL not set for network $NETWORK"
    exit 1
fi

echo "Deploying to $NETWORK..."

# 编译合约
echo "Compiling contracts..."
forge build

# 运行部署脚本
echo "Running deployment script..."
forge script script/NodeRegistry.s.sol:NodeRegistryScript \
    --rpc-url $RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key $VERIFY_KEY \
    -vvvv

# 检查部署结果
if [ $? -eq 0 ]; then
    echo "Deployment successful!"
else
    echo "Deployment failed!"
    exit 1
fi 