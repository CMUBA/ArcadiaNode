// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroV3.sol";

contract RegisterNFTInV3Script is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address officialNFT = 0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c;
        
        // 验证部署者身份
        address deployer = vm.addr(deployerPrivateKey);
        console.log("\nDeployer address:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. 获取合约实例
        HeroV3 hero = HeroV3(heroProxy);
        
        // 2. 检查当前注册状态
        bool isRegistered = hero.isRegistered(officialNFT);
        console.log("\nCurrent registration status:", isRegistered);
        
        if (!isRegistered) {
            // 3. 注册 NFT
            console.log("\nRegistering NFT...");
            hero.registerNFT(officialNFT, true);
            console.log("NFT registered");
            
            // 4. 验证注册
            isRegistered = hero.isRegistered(officialNFT);
            console.log("\nNew registration status:", isRegistered);
            
            address officialNFTAddr = hero.officialNFT();
            console.log("Official NFT address:", officialNFTAddr);
        } else {
            console.log("\nNFT already registered");
            address officialNFTAddr = hero.officialNFT();
            console.log("Official NFT address:", officialNFTAddr);
        }
        
        vm.stopBroadcast();
    }
}
