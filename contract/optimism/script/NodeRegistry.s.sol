// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {NodeRegistry} from "../src/NodeRegistry.sol";

contract NodeRegistryScript is Script {
    NodeRegistry public registry;

    function setUp() public {}

    function run() public {
        // 从环境变量加载配置
        address stakeManagerAddress = vm.envAddress("STAKE_MANAGER_ADDRESS");
        string memory ipOrDomain = vm.envString("NODE_IP");
        string memory apiIndexes = vm.envString("NODE_APIS");
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        // 开始部署
        vm.startBroadcast(deployerPrivateKey);
        
        // 部署 NodeRegistry
        registry = new NodeRegistry(
            stakeManagerAddress,
            ipOrDomain,
            apiIndexes
        );
        
        vm.stopBroadcast();
        
        // 输出详细的部署信息
        console.log("Deployment Info:");
        console.log("----------------");
        console.log("NodeRegistry deployed to:", address(registry));
        console.log("Stake Manager:", stakeManagerAddress);
        console.log("Deployer:", vm.addr(deployerPrivateKey));
        console.log("IP/Domain:", ipOrDomain);
        console.log("API Indexes:", apiIndexes);
        console.log("Block number:", block.number);
        console.log("Block timestamp:", block.timestamp);
        
        // 验证部署结果
        try registry.stakeManager() returns (address configuredStakeManager) {
            require(configuredStakeManager == stakeManagerAddress, "Stake manager address mismatch");
            console.log("[OK] Deployment verified");
        } catch {
            console.log("[ERROR] Deployment verification failed");
        }
    }
} 