#!/bin/bash

# Load environment variables from hero directory
source .env

# Deploy Hero contract to Optimism Sepolia
forge script script/DeployHero.s.sol \
    --rpc-url $OPTIMISM_TESTNET_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --etherscan-api-key $OPTIMISM_ETHERSCAN_API_KEY \
    -vvvv
