// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {StakeManager} from "../src/StakeManager.sol";

contract StakeManagerScript is Script {
    StakeManager public stakeManager;

    function setUp() public {}

    function run() public {
        // 从环境变量加载配置
        address stakingToken = vm.envAddress("STAKING_TOKEN_ADDRESS");
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // 部署合约
        stakeManager = new StakeManager(stakingToken);
        
        console.log("StakeManager deployed at:", address(stakeManager));
        console.log("Using staking token at:", stakingToken);

        vm.stopBroadcast();
    }
}