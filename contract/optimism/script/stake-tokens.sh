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
    "TOKEN_CONTRACT_ADDRESS"
    "STAKE_MANAGER_ADDRESS"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set in .env.$NETWORK"
        exit 1
    fi
done

echo "Staking tokens on $NETWORK..."
echo "Token contract: $TOKEN_CONTRACT_ADDRESS"
echo "StakeManager contract: $STAKE_MANAGER_ADDRESS"
echo "Deployer address: $(cast wallet address $DEPLOYER_PRIVATE_KEY)"

# 创建并执行质押脚本
cat > script/StakeTokens.s.sol << EOF
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/MushroomToken.sol";
import "../src/StakeManager.sol";

contract StakeTokensScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address tokenAddress = vm.envAddress("TOKEN_CONTRACT_ADDRESS");
        address stakeManagerAddress = vm.envAddress("STAKE_MANAGER_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        MushroomToken token = MushroomToken(tokenAddress);
        StakeManager stakeManager = StakeManager(stakeManagerAddress);
        address deployer = vm.addr(deployerPrivateKey);
        
        uint256 stakeAmount = 1000 * 10**18; // 质押 1000 代币
        
        // 先授权 StakeManager 使用代币
        token.approve(stakeManagerAddress, stakeAmount);
        
        // 质押代币
        stakeManager.stake(stakeAmount);
        
        // 获取并打印质押后的余额
        uint256 amount = stakeManager.getStakeAmount(deployer);
        
        vm.stopBroadcast();
        
        console.log("Staked 1000 tokens from deployer: %s", deployer);
        console.log("New stake balance: %d", amount);
    }
}
EOF

# 执行质押
forge script script/StakeTokens.s.sol:StakeTokensScript \
    --rpc-url $RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --broadcast \
    -vvvv

if [ $? -eq 0 ]; then
    echo "Token staking completed successfully!"
else
    echo "Error: Token staking failed"
    exit 1
fi 