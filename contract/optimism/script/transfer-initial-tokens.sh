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
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "Error: $var is not set in .env.$NETWORK"
        exit 1
    fi
done

echo "Transferring initial tokens on $NETWORK..."
echo "Token contract: $TOKEN_CONTRACT_ADDRESS"
echo "Deployer address: $(cast wallet address $DEPLOYER_PRIVATE_KEY)"

# 创建并执行转账脚本
cat > script/TransferInitialTokens.s.sol << EOF
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/MushroomToken.sol";

contract TransferInitialTokensScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address tokenAddress = vm.envAddress("TOKEN_CONTRACT_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        MushroomToken token = MushroomToken(tokenAddress);
        address deployer = vm.addr(deployerPrivateKey);
        
        // 从合约转 10 万代币给部署者
        token.transferFromContract(deployer, 100_000 * 10**18);
        
        vm.stopBroadcast();
        
        console.log("Transferred 100,000 tokens to deployer:", deployer);
    }
}
EOF

# 执行转账
forge script script/TransferInitialTokens.s.sol:TransferInitialTokensScript \
    --rpc-url $RPC_URL \
    --private-key $DEPLOYER_PRIVATE_KEY \
    --broadcast \
    -vvvv

if [ $? -eq 0 ]; then
    echo "Token transfer completed successfully!"
else
    echo "Error: Token transfer failed"
    exit 1
fi 