// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroV3.sol";
import "../src/core/HeroNFT.sol";

contract RegisterHeroRecordScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address officialNFT = 0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c;
        uint256 tokenId = 10001; // 我们之前铸造的 NFT ID
        
        // 验证部署者身份
        address deployer = vm.addr(deployerPrivateKey);
        console.log("\nDeployer address:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);

        // 1. 获取合约实例
        HeroV3 hero = HeroV3(heroProxy);
        
        // 2. 创建英雄记录
        string memory name = "Arcadian Warrior";
        string memory description = "A legendary warrior from the realm of Arcadia";
        
        string[] memory attributes = new string[](5);
        attributes[0] = "Strength";
        attributes[1] = "Agility";
        attributes[2] = "Intelligence";
        attributes[3] = "Vitality";
        attributes[4] = "Luck";
        
        uint256[] memory values = new uint256[](5);
        values[0] = 100;  // Strength
        values[1] = 80;   // Agility
        values[2] = 90;   // Intelligence
        values[3] = 85;   // Vitality
        values[4] = 70;   // Luck
        
        console.log("\nRegistering hero record...");
        hero.registerHeroRecord(
            officialNFT,
            tokenId,
            name,
            description,
            attributes,
            values
        );
        console.log("Hero record registered");
        
        // 3. 添加初始技能
        console.log("\nAdding initial skills...");
        hero.upgradeSkill(officialNFT, tokenId, "Sword Mastery", 1);
        hero.upgradeSkill(officialNFT, tokenId, "Shield Defense", 1);
        hero.upgradeSkill(officialNFT, tokenId, "Battle Tactics", 1);
        console.log("Skills added");
        
        // 4. 验证英雄记录
        (
            string memory heroName,
            string memory heroDesc,
            string[] memory heroAttrs,
            uint256[] memory heroValues
        ) = hero.getHeroRecord(officialNFT, tokenId);
        
        console.log("\nHero Record:");
        console.log("Name:", heroName);
        console.log("Description:", heroDesc);
        console.log("\nAttributes:");
        for (uint i = 0; i < heroAttrs.length; i++) {
            console.log(heroAttrs[i], ":", heroValues[i]);
        }
        
        // 5. 验证技能
        (string[] memory skills, uint256[] memory levels) = hero.getHeroSkills(officialNFT, tokenId);
        console.log("\nSkills:");
        for (uint i = 0; i < skills.length; i++) {
            console.log(skills[i], "Level:", levels[i]);
        }
        
        // 6. 验证等级
        (uint256 level, uint256 exp) = hero.getHeroLevel(officialNFT, tokenId);
        console.log("\nLevel Info:");
        console.log("Level:", level);
        console.log("Experience:", exp);
        
        vm.stopBroadcast();
    }
}
