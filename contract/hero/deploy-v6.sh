#!/bin/bash
source .env && forge script script/DeployAndInitV6.s.sol:DeployAndInitV6Script --rpc-url $OPTIMISM_SEPOLIA_RPC_URL --broadcast -vvvv 