#!/bin/bash

# Load environment variables
source .env

echo "Deploying Move contracts..."

# Compile contracts
echo "Compiling contracts..."
aptos move compile || exit 1

# Deploy HeroNFT contract
echo "Deploying HeroNFT contract..."
aptos move publish \
    --named-addresses hero_nft=$APTOS_ADMIN_ACCOUNT \
    --private-key $APTOS_ADMIN_PRIVATE_KEY \
    || exit 1

# Deploy HeroMetadata contract
echo "Deploying HeroMetadata contract..."
aptos move publish \
    --named-addresses hero_metadata=$APTOS_ADMIN_ACCOUNT \
    --private-key $APTOS_ADMIN_PRIVATE_KEY \
    || exit 1

# Deploy Hero contract
echo "Deploying Hero contract..."
aptos move publish \
    --named-addresses hero=$APTOS_ADMIN_ACCOUNT \
    --private-key $APTOS_ADMIN_PRIVATE_KEY \
    || exit 1

echo "All contracts deployed successfully!" 