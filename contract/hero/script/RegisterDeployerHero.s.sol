// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroV2.sol";
import "../src/core/HeroNFT.sol";

contract RegisterDeployerHeroScript is Script {
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
        HeroV2 hero = HeroV2(heroProxy);
        HeroNFT nft = HeroNFT(officialNFT);
        
        // 2. 检查部署者的 NFT
        uint256 balance = nft.balanceOf(deployer);
        console.log("\nDeployer NFT balance:", balance);
        
        uint256 tokenId = 10001; // 使用新的 tokenId
        if (balance == 0) {
            console.log("Minting NFT for deployer...");
            uint256 mintPrice = nft.defaultNativePrice();
            console.log("Mint price:", mintPrice);
            nft.mint{value: mintPrice}(deployer, tokenId);
            console.log("New NFT minted with ID:", tokenId);
            balance = nft.balanceOf(deployer);
            console.log("New NFT balance:", balance);
        } else {
            console.log("Using existing NFT with ID:", tokenId);
        }
        
        // 3. 检查并注册 NFT 合约
        bool isRegistered = hero.isRegistered(officialNFT);
        if (!isRegistered) {
            console.log("\nRegistering official NFT...");
            hero.registerNFT(officialNFT, true);
            console.log("Official NFT registered");
        } else {
            console.log("\nOfficial NFT already registered");
        }
        
        // 4. 验证注册状态
        address registeredOfficialNFT = hero.officialNFT();
        console.log("\nRegistration Status:");
        console.log("Official NFT address:", registeredOfficialNFT);
        console.log("Is registered?", hero.isRegistered(officialNFT));
        
        // 5. 获取所有已注册的 NFT
        address[] memory registeredNFTs = hero.getRegisteredNFTs();
        console.log("\nAll registered NFTs:");
        for (uint i = 0; i < registeredNFTs.length; i++) {
            console.log(registeredNFTs[i]);
        }
        
        vm.stopBroadcast();
    }
}
