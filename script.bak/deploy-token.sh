#!/bin/bash

# Check if network argument is provided
if [ $# -ne 1 ]; then
    echo "Usage: $0 <network>"
    echo "Example: $0 optimism-sepolia"
    exit 1
fi

NETWORK=$1
ENV_FILE=".env.${NETWORK}"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: Environment file $ENV_FILE not found"
    exit 1
fi

# Load environment variables
set -a
source "$ENV_FILE"
set +a

# Debug: Print environment variables (hide sensitive data)
echo "Debug: Checking environment variables..."
echo "RPC_URL is set: [${RPC_URL:+yes}${RPC_URL:-no}]"
echo "DEPLOYER_PRIVATE_KEY is set: [${DEPLOYER_PRIVATE_KEY:+yes}${DEPLOYER_PRIVATE_KEY:-no}]"
echo "Current directory: $(pwd)"
echo "Environment file path: $(realpath "$ENV_FILE")"

echo "Deploying MushroomToken to ${NETWORK}..."

# Deploy the contract
forge script script/MushroomToken.s.sol:MushroomTokenScript \
    --rpc-url "$RPC_URL" \
    --private-key "$DEPLOYER_PRIVATE_KEY" \
    --broadcast \
    --verify-contract-address 0x822D58f06e7c77B9D17Efbda5Be2378Ec5CDA374 \
    --verifier-url https://api-sepolia-optimistic.etherscan.io/api \
    --etherscan-api-key "$OPTIMISM_ETHERSCAN_API_KEY" \
    -vvvv

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "MushroomToken deployment completed successfully!"
else
    echo "Error: MushroomToken deployment failed"
    exit 1
fi 