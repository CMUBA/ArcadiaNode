// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroMetadata.sol";

contract InitMetadataScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address metadataProxy = vm.envAddress("VITE_HERO_METADATA_PROXY");
        
        HeroMetadata metadata = HeroMetadata(metadataProxy);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Spring (Season 0) skills
        metadata.setSkill(0, 0, 1, "Eagle Eye", 2, true);
        metadata.setSkill(0, 0, 2, "Eagle Eye", 4, true);
        metadata.setSkill(0, 0, 3, "Eagle Eye", 6, true);
        metadata.setSkill(0, 0, 4, "Eagle Eye", 8, true);
        metadata.setSkill(0, 0, 5, "Eagle Eye", 10, true);
        
        metadata.setSkill(0, 1, 1, "Spider Sense", 1, true);
        metadata.setSkill(0, 1, 2, "Spider Sense", 3, true);
        metadata.setSkill(0, 1, 3, "Spider Sense", 5, true);
        
        metadata.setSkill(0, 2, 1, "Holy Counter", 1, true);
        metadata.setSkill(0, 2, 2, "Holy Counter", 3, true);
        
        // Summer (Season 1) skills
        metadata.setSkill(1, 0, 1, "Sharpen", 5, true);
        metadata.setSkill(1, 0, 2, "Sharpen", 10, true);
        metadata.setSkill(1, 0, 3, "Sharpen", 15, true);
        metadata.setSkill(1, 0, 4, "Sharpen", 20, true);
        metadata.setSkill(1, 0, 5, "Sharpen", 25, true);
        
        metadata.setSkill(1, 1, 1, "Critical Strike", 1, true);
        metadata.setSkill(1, 1, 2, "Critical Strike", 2, true);
        metadata.setSkill(1, 1, 3, "Critical Strike", 3, true);
        
        // Autumn (Season 2) skills
        metadata.setSkill(2, 0, 1, "Body Enhancement", 5, true);
        metadata.setSkill(2, 0, 2, "Body Enhancement", 10, true);
        metadata.setSkill(2, 0, 3, "Body Enhancement", 15, true);
        metadata.setSkill(2, 0, 4, "Body Enhancement", 20, true);
        metadata.setSkill(2, 0, 5, "Body Enhancement", 25, true);
        
        metadata.setSkill(2, 1, 1, "Block", 1, true);
        metadata.setSkill(2, 1, 2, "Block", 2, true);
        metadata.setSkill(2, 1, 3, "Block", 3, true);
        
        // Winter (Season 3) skills
        metadata.setSkill(3, 0, 1, "Defense Mastery", 5, true);
        metadata.setSkill(3, 0, 2, "Defense Mastery", 10, true);
        metadata.setSkill(3, 0, 3, "Defense Mastery", 15, true);
        metadata.setSkill(3, 0, 4, "Defense Mastery", 20, true);
        metadata.setSkill(3, 0, 5, "Defense Mastery", 25, true);
        
        vm.stopBroadcast();
    }
}