// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {NodeRegistry} from "../src/NodeRegistry.sol";

contract NodeRegistryScript is Script {
    NodeRegistry public registry;

    function setUp() public {}

    function run() public {
        // 从环境变量加载 stake manager 地址
        address stakeManagerAddress = vm.envAddress("STAKE_MANAGER_ADDRESS");
        
        vm.startBroadcast();

        // 使用环境变量中的地址部署合约
        registry = new NodeRegistry(stakeManagerAddress);
        
        console.log("NodeRegistry deployed at:", address(registry));
        console.log("Using StakeManager at:", stakeManagerAddress);

        vm.stopBroadcast();
    }
} 