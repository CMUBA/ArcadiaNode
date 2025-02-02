#!/bin/bash

# 确保目标目录存在
# mkdir -p ../../client/public/abi

# 复制 NodeRegistry ABI
cp ../out/NodeRegistry.sol/NodeRegistry.json ../../client/public/abi/NodeRegistry.json

# 复制 MushroomToken ABI
cp ../out/MushroomToken.sol/MushroomToken.json ../../client/public/abi/MushroomToken.json

# 复制 StakeManager ABI
cp ../out/StakeManager.sol/StakeManager.json ../../client/public/abi/StakeManager.json

echo "ABI files have been copied successfully!" 