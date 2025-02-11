// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroV4.sol";
import "../src/core/HeroNFT.sol";

contract RegisterNewHeroNFTScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address nftProxy = vm.envAddress("VITE_HERO_NFT_PROXY");
        
        // 验证部署者身份
        address deployer = vm.addr(deployerPrivateKey);
        console.log("\nDeployer address:", deployer);
        
        // 验证合约状态
        HeroV4 hero = HeroV4(heroProxy);
        string memory version = hero.VERSION();
        console.log("\nHero contract version:", version);
        require(
            keccak256(bytes(version)) == keccak256(bytes("4.0.0")),
            "Hero contract must be V4"
        );
        
        // 验证 NFT 合约
        HeroNFT nft = HeroNFT(nftProxy);
        string memory nftVersion = nft.VERSION();
        console.log("NFT contract version:", nftVersion);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 注册 NFT
        hero.registerNFT(nftProxy, true);
        console.log("\nNFT registered successfully");
        
        // 验证注册
        address officialNFT = hero.officialNFT();
        console.log("\nVerification:");
        console.log("Official NFT:", officialNFT);
        require(officialNFT == nftProxy, "NFT registration failed");
        
        // 验证 NFT 是否已注册
        bool isRegistered = hero.isRegistered(nftProxy);
        console.log("Is NFT registered:", isRegistered);
        require(isRegistered, "NFT not registered");
        
        vm.stopBroadcast();
    }
}
