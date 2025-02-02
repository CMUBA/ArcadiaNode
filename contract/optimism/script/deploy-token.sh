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
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set in .env.$NETWORK"
        exit 1
    fi
done

echo "Deploying MushroomToken to $NETWORK..."

# 部署 MushroomToken
forge script script/MushroomToken.s.sol:MushroomTokenScript \
    --rpc-url $RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --broadcast \
    -vvvv

if [ $? -eq 0 ]; then
    echo "MushroomToken deployment completed successfully!"
    
    # 获取部署的合约地址
    CONTRACT_ADDRESS=$(grep -A1 "== Logs ==" broadcast/MushroomToken.s.sol/11155420/run-latest.json | tail -n1 | awk '{print $NF}' | tr -d '"')
    echo "Contract deployed at: $CONTRACT_ADDRESS"
    
    # 保存合约地址到文件中，供验证脚本使用
    echo "$CONTRACT_ADDRESS" > .mushroom-token-address
else
    echo "Error: MushroomToken deployment failed"
    exit 1
fi 