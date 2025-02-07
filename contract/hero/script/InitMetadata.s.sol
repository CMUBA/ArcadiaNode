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
        // Season 0 skills
        metadata.setSkill(0, 0, 1, "Eagle Eye", 2, true);
        metadata.setSkill(0, 1, 2, "Spider Sense", 3, true);
        metadata.setSkill(0, 2, 3, "Holy Counter", 4, true);
        
        // Season 1 skills
        metadata.setSkill(1, 0, 1, "Weapon Sharpen", 2, true);
        metadata.setSkill(1, 1, 2, "Critical Strike", 3, true);
        metadata.setSkill(1, 2, 3, "Body Enhancement", 4, true);
        
        // Season 2 skills
        metadata.setSkill(2, 0, 1, "Block", 2, true);
        metadata.setSkill(2, 1, 2, "Defense Mastery", 3, true);
        metadata.setSkill(2, 2, 3, "Blood Strike", 4, true);
        
        vm.stopBroadcast();
    }
} 