// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroV6.sol";
import "../src/core/HeroNFT.sol";
import "../src/core/HeroMetadata.sol";

contract DeployAndInitV6Script is Script {
    HeroNFT public heroNFT;
    HeroV6 public hero;
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

        // Deploy HeroV6
        hero = new HeroV6();
        console.log("HeroV6 deployed to:", address(hero));

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
                "Genesis Hero V6",
                HeroV6.Race.Human,
                HeroV6.Gender.Male
            ) {
                console.log("Successfully created first hero record");

                // Initialize hero with some data using saveHeroFullData
                HeroV6.SeasonSkills[4] memory seasonSkills;
                // Set initial skills for all seasons
                for(uint8 i = 0; i < 4; i++) {
                    seasonSkills[i].skillLevels = [10, 8, 6, 4, 2];
                }

                HeroV6.Equipment[] memory equipment = new HeroV6.Equipment[](0);

                HeroV6.SaveHeroFullDataParams memory params = HeroV6.SaveHeroFullDataParams({
                    name: "Genesis Hero V6",
                    race: HeroV6.Race.Human,
                    gender: HeroV6.Gender.Male,
                    level: 1,
                    energy: 100,
                    dailyPoints: 0,
                    seasonSkills: seasonSkills,
                    equipment: equipment
                });

                try hero.saveHeroFullData(address(heroNFT), 1, params) {
                    console.log("Successfully initialized hero data");
                } catch Error(string memory reason) {
                    console.log("Failed to initialize hero data");
                    console.log("Reason:", reason);
                }
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
        console.log("\n=== Hero System V6 Deployment Information ===");
        console.log("Deployer Address: %s", deployer);
        console.log("\nContract Addresses:");
        console.log("HeroNFT: %s", address(heroNFT));
        console.log("HeroMetadata: %s", address(heroMetadata));
        console.log("HeroV6: %s", address(hero));
        
        console.log("\nInitial Setup:");
        console.log("- Deployed core contracts");
        console.log("- Initialized metadata (skills, race, class)");
        console.log("- Registered NFT contract");
        console.log("- Minted first NFT (ID: 1)");
        console.log("- Created first hero record");
        console.log("- Initialized hero data with saveHeroFullData");
        
        console.log("\nFor environment file (.env):");
        console.log("VITE_HERO_NFT_ADDRESS=%s", address(heroNFT));
        console.log("VITE_HERO_METADATA_ADDRESS=%s", address(heroMetadata));
        console.log("VITE_HERO_ADDRESS=%s", address(hero));
    }
} 