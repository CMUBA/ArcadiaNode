#!/bin/bash

# Load environment variables
source .env

# Create a temporary Move.toml with replaced addresses
cp Move.toml Move.toml.bak
sed -i '' "s/hero = \"_\"/hero = \"$HERO_ADDRESS\"/" Move.toml
sed -i '' "s/hero_nft = \"_\"/hero_nft = \"$HERO_NFT_ADDRESS\"/" Move.toml

# Compile Move contracts
aptos move compile

# Restore original Move.toml
mv Move.toml.bak Move.toml

echo "Compilation completed!" 