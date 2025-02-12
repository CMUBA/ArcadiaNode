// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroV5.sol";
import "../src/core/HeroNFT.sol";
import "../src/core/HeroMetadata.sol";

contract DeployAndInitScript is Script {
    HeroNFT public heroNFT;
    HeroV5 public hero;
    HeroMetadata public heroMetadata;
    address public deployer;

    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy contracts
        address defaultToken = address(0); // Use zero address as default token
        uint256 nativePrice = 0.01 ether;  // Set default native token price
        uint256 tokenPrice = 100 * 10**18; // Set default token price
        
        // Deploy HeroNFT
        heroNFT = new HeroNFT(
            defaultToken,
            nativePrice,
            tokenPrice
        );
        console.log("HeroNFT deployed to:", address(heroNFT));

        // Deploy HeroMetadata
        heroMetadata = new HeroMetadata();
        console.log("HeroMetadata deployed to:", address(heroMetadata));

        // Deploy Hero
        hero = new HeroV5();
        console.log("HeroV5 deployed to:", address(hero));

        // Initialize Metadata
        // Set initial skills for Spring season
        heroMetadata.setSkill(0, 0, 1, "Eagle Eye", 2, true);
        heroMetadata.setSkill(0, 1, 1, "Spider Sense", 1, true);
        heroMetadata.setSkill(0, 2, 1, "Holy Counter", 1, true);
        
        // Set initial race attributes
        uint16[4] memory humanAttributes = [uint16(10), uint16(10), uint16(10), uint16(10)];
        heroMetadata.setRace(0, humanAttributes, "Human race with balanced attributes", true);

        // Set initial class attributes and growth rates
        uint16[4] memory warriorAttributes = [uint16(12), uint16(15), uint16(20), uint16(18)];
        uint16[4] memory warriorGrowth = [uint16(2), uint16(3), uint16(4), uint16(3)];
        heroMetadata.setClass(0, warriorAttributes, warriorGrowth, "Warrior class focused on strength", true);

        // Register NFT contract in Hero system
        hero.registerNFT(address(heroNFT), true);
        console.log("Registered NFT contract in Hero system");

        // Mint first test NFT to deployer
        uint256 mintPrice = 0.01 ether;
        try heroNFT.mint{value: mintPrice}(deployer, 1) {
            console.log("Successfully minted first NFT to deployer");
            
            // Create hero record for the minted NFT
            try hero.createHero(
                address(heroNFT),
                1,
                "Genesis Hero",
                HeroV5.Race.Human,
                HeroV5.Gender.Male
            ) {
                console.log("Successfully created first hero record");
            } catch Error(string memory reason) {
                console.log("Failed to create hero record");
                console.log("Reason:", reason);
            }
        } catch Error(string memory reason) {
            console.log("Failed to mint NFT");
            console.log("Reason:", reason);
        }

        vm.stopBroadcast();
        
        // Output deployment information
        outputDeploymentInfo();
    }

    function outputDeploymentInfo() internal view {
        console.log("\n=== Hero System Deployment Information ===");
        console.log("Deployer Address: %s", deployer);
        console.log("\nContract Addresses:");
        console.log("HeroNFT: %s", address(heroNFT));
        console.log("HeroMetadata: %s", address(heroMetadata));
        console.log("HeroV5: %s", address(hero));
        
        console.log("\nInitial Setup:");
        console.log("- Deployed core contracts");
        console.log("- Initialized metadata (skills, race, class)");
        console.log("- Registered NFT contract");
        console.log("- Minted first NFT (ID: 1)");
        console.log("- Created first hero record");
        
        console.log("\nFor environment file (.env):");
        console.log("VITE_HERO_NFT_ADDRESS=%s", address(heroNFT));
        console.log("VITE_HERO_METADATA_ADDRESS=%s", address(heroMetadata));
        console.log("VITE_HERO_ADDRESS=%s", address(hero));
    }
}
