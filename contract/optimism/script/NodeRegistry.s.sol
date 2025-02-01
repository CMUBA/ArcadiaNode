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
        
        vm.startBroadcast(deployerPrivateKey);

        // 部署合约
        registry = new NodeRegistry(
            stakeManagerAddress,
            ipOrDomain,
            apiIndexes
        );
        
        console.log("NodeRegistry deployed at:", address(registry));
        console.log("Using stake manager at:", stakeManagerAddress);

        vm.stopBroadcast();
    }
} 