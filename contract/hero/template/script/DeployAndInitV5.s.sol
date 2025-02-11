// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroV5.sol";

contract DeployAndInitV5Script is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("HERO_PRIVATE_KEY");
        address heroNFTProxy = vm.envAddress("VITE_HERO_NFT_PROXY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. 部署合约
        HeroV5 hero = new HeroV5();
        console.log("HeroV5 deployed at:", address(hero));
        
        // 2. 注册NFT合约
        hero.registerNFT(heroNFTProxy, true);
        console.log("Registered NFT contract:", heroNFTProxy);
        
        vm.stopBroadcast();
        
        // 3. 输出地址用于更新 .env
        console.log("\nUpdate your .env file with:");
        console.log("VITE_HERO_V5=%s", address(hero));
    }
}