// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroV2.sol";
import "../src/core/HeroNFT.sol";

contract QueryHeroInfoScript is Script {
    function run() external view {
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address officialNFT = 0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c;
        uint256 tokenId = 10001; // 我们刚刚铸造的 NFT ID
        
        // 1. 获取合约实例
        HeroV2 hero = HeroV2(heroProxy);
        HeroNFT nft = HeroNFT(officialNFT);
        
        // 2. 显示基本信息
        console.log("\nHero Contract Info:");
        console.log("Hero Proxy:", address(hero));
        console.log("Official NFT:", officialNFT);
        console.log("Version:", hero.VERSION());
        
        // 3. 显示 NFT 信息
        address owner = nft.ownerOf(tokenId);
        console.log("\nNFT Info:");
        console.log("Token ID:", tokenId);
        console.log("Owner:", owner);
        
        // 4. 显示英雄记录
        try hero.getHeroRecord(officialNFT, tokenId) returns (
            string memory name,
            string memory description,
            string[] memory attributes,
            uint256[] memory values
        ) {
            console.log("\nHero Record:");
            console.log("Name:", name);
            console.log("Description:", description);
            console.log("\nAttributes:");
            for (uint i = 0; i < attributes.length; i++) {
                console.log(attributes[i], ":", values[i]);
            }
        } catch {
            console.log("\nNo hero record found or function not available");
        }
        
        // 5. 显示其他可能的信息
        try hero.getHeroLevel(officialNFT, tokenId) returns (uint256 level) {
            console.log("\nHero Level:", level);
        } catch {
            console.log("\nLevel information not available");
        }
        
        try hero.getHeroSkills(officialNFT, tokenId) returns (
            string[] memory skills,
            uint256[] memory levels
        ) {
            console.log("\nHero Skills:");
            for (uint i = 0; i < skills.length; i++) {
                console.log(skills[i], "Level:", levels[i]);
            }
        } catch {
            console.log("\nSkill information not available");
        }
    }
}
