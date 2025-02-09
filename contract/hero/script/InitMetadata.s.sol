// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroMetadata.sol";

contract InitMetadataScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address metadataProxy = vm.envAddress("HERO_METADATA_PROXY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        HeroMetadata metadata = HeroMetadata(metadataProxy);
        
        // Initialize races
        metadata.setRace(0, [uint16(10), uint16(10), uint16(10), uint16(10)], "Humans are versatile and adaptable", true);
        metadata.setRace(1, [uint16(12), uint16(8), uint16(12), uint16(8)], "Orcs are strong and durable", true);
        metadata.setRace(2, [uint16(8), uint16(12), uint16(8), uint16(12)], "Elves are agile and intelligent", true);
        metadata.setRace(3, [uint16(15), uint16(5), uint16(15), uint16(5)], "Giants are extremely strong but slow", true);
        metadata.setRace(4, [uint16(5), uint16(15), uint16(5), uint16(15)], "Fairies are weak but highly intelligent", true);
        
        // Initialize classes
        metadata.setClass(0, 
            [uint16(2), uint16(1), uint16(2), uint16(1)], 
            [uint16(3), uint16(1), uint16(3), uint16(1)], 
            "Warrior - Expert in close combat", 
            true
        );
        metadata.setClass(1, 
            [uint16(1), uint16(2), uint16(1), uint16(2)], 
            [uint16(1), uint16(3), uint16(1), uint16(3)], 
            "Mage - Master of arcane arts", 
            true
        );
        metadata.setClass(2, 
            [uint16(2), uint16(2), uint16(1), uint16(1)], 
            [uint16(2), uint16(2), uint16(1), uint16(1)], 
            "Ranger - Skilled in ranged combat", 
            true
        );
        metadata.setClass(3, 
            [uint16(1), uint16(1), uint16(2), uint16(2)], 
            [uint16(1), uint16(1), uint16(2), uint16(2)], 
            "Rogue - Specializes in stealth", 
            true
        );
        metadata.setClass(4, 
            [uint16(1), uint16(2), uint16(2), uint16(1)], 
            [uint16(1), uint16(2), uint16(2), uint16(1)], 
            "Paladin - Holy warrior", 
            true
        );
        
        // Initialize skills for each season
        // Spring (Season 0) skills
        metadata.setSkill(0, 0, 1, "鹰眼", 2, true);
        metadata.setSkill(0, 0, 2, "鹰眼", 4, true);
        metadata.setSkill(0, 0, 3, "鹰眼", 6, true);
        metadata.setSkill(0, 0, 4, "鹰眼", 8, true);
        metadata.setSkill(0, 0, 5, "鹰眼", 10, true);
        
        metadata.setSkill(0, 1, 1, "蜘蛛感应", 1, true);
        metadata.setSkill(0, 1, 2, "蜘蛛感应", 3, true);
        metadata.setSkill(0, 1, 3, "蜘蛛感应", 5, true);
        
        metadata.setSkill(0, 2, 1, "圣灵反击", 1, true);
        metadata.setSkill(0, 2, 2, "圣灵反击", 3, true);
        
        // Summer (Season 1) skills
        metadata.setSkill(1, 0, 1, "磨刀", 5, true);
        metadata.setSkill(1, 0, 2, "磨刀", 10, true);
        metadata.setSkill(1, 0, 3, "磨刀", 15, true);
        metadata.setSkill(1, 0, 4, "磨刀", 20, true);
        metadata.setSkill(1, 0, 5, "磨刀", 25, true);
        
        metadata.setSkill(1, 1, 1, "暴击", 1, true);
        metadata.setSkill(1, 1, 2, "暴击", 2, true);
        metadata.setSkill(1, 1, 3, "暴击", 3, true);
        
        // Autumn (Season 2) skills
        metadata.setSkill(2, 0, 1, "强化身体", 5, true);
        metadata.setSkill(2, 0, 2, "强化身体", 10, true);
        metadata.setSkill(2, 0, 3, "强化身体", 15, true);
        metadata.setSkill(2, 0, 4, "强化身体", 20, true);
        metadata.setSkill(2, 0, 5, "强化身体", 25, true);
        
        metadata.setSkill(2, 1, 1, "格挡", 1, true);
        metadata.setSkill(2, 1, 2, "格挡", 2, true);
        metadata.setSkill(2, 1, 3, "格挡", 3, true);
        
        // Winter (Season 3) skills
        metadata.setSkill(3, 0, 1, "防御专精", 5, true);
        metadata.setSkill(3, 0, 2, "防御专精", 10, true);
        metadata.setSkill(3, 0, 3, "防御专精", 15, true);
        metadata.setSkill(3, 0, 4, "防御专精", 20, true);
        metadata.setSkill(3, 0, 5, "防御专精", 25, true);
        
        metadata.setSkill(3, 1, 1, "鲜血打击", 1, true);
        metadata.setSkill(3, 1, 2, "鲜血打击", 2, true);
        
        vm.stopBroadcast();
    }
} 