#!/bin/bash

# Load environment variables
source .env

echo "Initializing Move contracts..."

# Initialize HeroNFT contract
echo "Initializing HeroNFT contract..."
aptos move run \
    --function-id $APTOS_ADMIN_ACCOUNT::hero_nft::initialize \
    --private-key $APTOS_ADMIN_PRIVATE_KEY \
    || exit 1

# Initialize HeroMetadata contract
echo "Initializing HeroMetadata contract..."
aptos move run \
    --function-id $APTOS_ADMIN_ACCOUNT::metadata::initialize \
    --private-key $APTOS_ADMIN_PRIVATE_KEY \
    || exit 1

# Initialize Hero contract
echo "Initializing Hero contract..."
aptos move run \
    --function-id $APTOS_ADMIN_ACCOUNT::hero::initialize \
    --private-key $APTOS_ADMIN_PRIVATE_KEY \
    || exit 1

# Register HeroNFT in Hero contract
echo "Registering HeroNFT in Hero contract..."
aptos move run \
    --function-id $APTOS_ADMIN_ACCOUNT::hero::register_nft \
    --args address:$APTOS_ADMIN_ACCOUNT \
    --private-key $APTOS_ADMIN_PRIVATE_KEY \
    || exit 1

echo "All contracts initialized successfully!" 