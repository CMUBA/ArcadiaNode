// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroV4.sol";

contract QueryHeroV4Script is Script {
    function run() external view {
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address officialNFT = 0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c;
        uint256 tokenId = 10001; // 我们之前铸造的 NFT ID
        
        // 1. 获取合约实例
        HeroV4 hero = HeroV4(heroProxy);
        
        // 2. 显示合约基本信息
        console.log("\nContract Info:");
        console.log("Version:", hero.VERSION());
        console.log("Official NFT:", hero.officialNFT());
        
        // 3. 显示注册的 NFT 列表
        address[] memory nfts = hero.getRegisteredNFTs();
        console.log("\nRegistered NFTs:");
        for (uint i = 0; i < nfts.length; i++) {
            console.log(nfts[i]);
        }
        
        // 4. 尝试获取英雄信息
        try hero.getHeroInfo(officialNFT, tokenId) returns (
            string memory name,
            HeroV4.Race race,
            HeroV4.Gender gender,
            uint256 level,
            uint256 energy,
            uint256 dailyPoints
        ) {
            console.log("\nHero Info:");
            console.log("Name:", name);
            console.log("Race:", uint(race));  // 0: Human, 1: Elf, 2: Dwarf, 3: Orc, 4: Undead
            console.log("Gender:", uint(gender));  // 0: Male, 1: Female
            console.log("Level:", level);
            console.log("Energy:", energy);
            console.log("Daily Points:", dailyPoints);
            
            // 5. 获取四季技能
            console.log("\nSkills:");
            string[4] memory seasons = ["Spring", "Summer", "Autumn", "Winter"];
            for (uint s = 0; s < 4; s++) {
                uint8[5] memory skills = hero.getHeroSkills(officialNFT, tokenId, HeroV4.Season(s));
                console.log(seasons[s], "Skills:");
                for (uint i = 0; i < 5; i++) {
                    if (skills[i] > 0) {
                        console.log("  Skill", i + 1, "Level:", skills[i]);
                    }
                }
            }
            
            // 6. 获取装备信息
            HeroV4.Equipment[] memory equipment = hero.getHeroEquipment(officialNFT, tokenId);
            console.log("\nEquipment:");
            string[3] memory slots = ["Weapon", "Armor", "Accessory"];
            for (uint i = 0; i < equipment.length; i++) {
                console.log(slots[equipment[i].slot], ":");
                console.log("  Contract:", equipment[i].contractAddress);
                console.log("  Token ID:", equipment[i].tokenId);
            }
            
        } catch Error(string memory reason) {
            console.log("\nFailed to get hero info:", reason);
        }
        
        // 7. 显示系统常量
        console.log("\nSystem Constants:");
        console.log("Max Daily Energy:", hero.MAX_DAILY_ENERGY());
        console.log("Max Daily Points:", hero.MAX_DAILY_POINTS());
    }
}
