// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {StakeManager} from "../src/StakeManager.sol";

contract StakeManagerScript is Script {
    StakeManager public manager;

    function setUp() public {}

    function run() public {
        // 从环境变量加载配置
        address tokenAddress = vm.envAddress("TOKEN_CONTRACT_ADDRESS");
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // 部署合约
        manager = new StakeManager(tokenAddress);
        
        console.log("StakeManager deployed at:", address(manager));
        console.log("Using token at:", tokenAddress);

        vm.stopBroadcast();
    }
}