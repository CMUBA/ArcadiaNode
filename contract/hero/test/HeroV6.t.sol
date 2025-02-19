// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/core/HeroV6.sol";

contract HeroV6Test is Test {
    HeroV6 public hero;
    address public constant NFT_CONTRACT = address(1);
    uint256 public constant TOKEN_ID = 1;

    function setUp() public {
        hero = new HeroV6();
        hero.registerNFT(NFT_CONTRACT, true);
        hero.createHero(NFT_CONTRACT, TOKEN_ID, "TestHero", HeroV6.Race.Human, HeroV6.Gender.Male);
    }

    function testCreateHero() public {
        (
            string memory name,
            HeroV6.Race race,
            HeroV6.Gender gender,
            uint256 level,
            uint256 energy,
            uint256 dailyPoints
        ) = hero.getHeroInfo(NFT_CONTRACT, TOKEN_ID);

        assertEq(name, "TestHero");
        assertEq(uint8(race), uint8(HeroV6.Race.Human));
        assertEq(uint8(gender), uint8(HeroV6.Gender.Male));
        assertEq(level, 1);
        assertEq(energy, 100);
        assertEq(dailyPoints, 0);
    }

    function testSaveBasicInfo() public {
        HeroV6.SaveBasicInfoParams memory params = HeroV6.SaveBasicInfoParams({
            name: "UpdatedHero",
            race: HeroV6.Race.Elf,
            gender: HeroV6.Gender.Female,
            level: 5
        });

        bytes memory data = abi.encode(params);
        hero.saveHero(NFT_CONTRACT, TOKEN_ID, 0, data);

        (
            string memory name,
            HeroV6.Race race,
            HeroV6.Gender gender,
            uint256 level,
            ,
            
        ) = hero.getHeroInfo(NFT_CONTRACT, TOKEN_ID);

        assertEq(name, "UpdatedHero");
        assertEq(uint8(race), uint8(HeroV6.Race.Elf));
        assertEq(uint8(gender), uint8(HeroV6.Gender.Female));
        assertEq(level, 5);
    }

    function testSaveSkills() public {
        HeroV6.SaveSkillParams memory params = HeroV6.SaveSkillParams({
            season: HeroV6.Season.Spring,
            skillIndex: 0,
            level: 5
        });

        bytes memory data = abi.encode(params);
        hero.saveHero(NFT_CONTRACT, TOKEN_ID, 1, data);

        uint8[5] memory skills = hero.getHeroSkills(NFT_CONTRACT, TOKEN_ID, HeroV6.Season.Spring);
        assertEq(skills[0], 5);
    }

    function testSaveEquipment() public {
        address equipContract = address(2);
        uint256 equipTokenId = 1;

        HeroV6.SaveEquipmentParams memory params = HeroV6.SaveEquipmentParams({
            slot: 0,
            equipContract: equipContract,
            equipTokenId: equipTokenId
        });

        bytes memory data = abi.encode(params);
        hero.saveHero(NFT_CONTRACT, TOKEN_ID, 2, data);

        HeroV6.Equipment[] memory equipment = hero.getHeroEquipment(NFT_CONTRACT, TOKEN_ID);
        assertEq(equipment.length, 1);
        assertEq(equipment[0].contractAddress, equipContract);
        assertEq(equipment[0].tokenId, equipTokenId);
        assertEq(equipment[0].slot, 0);
    }

    function testSaveDailyPoints() public {
        uint256 points = 500;
        bytes memory data = abi.encode(points);
        hero.saveHero(NFT_CONTRACT, TOKEN_ID, 3, data);

        (,,,,, uint256 dailyPoints) = hero.getHeroInfo(NFT_CONTRACT, TOKEN_ID);
        assertEq(dailyPoints, points);
    }

    function testSaveEnergy() public {
        uint256 energyToConsume = 50;
        bytes memory data = abi.encode(energyToConsume);
        hero.saveHero(NFT_CONTRACT, TOKEN_ID, 4, data);

        (,,,, uint256 energy,) = hero.getHeroInfo(NFT_CONTRACT, TOKEN_ID);
        assertEq(energy, 50); // 100 - 50
    }

    function testLoadHero() public {
        // Set up hero data
        testSaveBasicInfo();
        testSaveSkills();
        testSaveEquipment();
        testSaveDailyPoints();
        testSaveEnergy();

        HeroV6.HeroFullData memory data = hero.loadHero(NFT_CONTRACT, TOKEN_ID);

        assertEq(data.name, "UpdatedHero");
        assertEq(uint8(data.race), uint8(HeroV6.Race.Elf));
        assertEq(uint8(data.gender), uint8(HeroV6.Gender.Female));
        assertEq(data.level, 5);
        assertEq(data.energy, 50);
        assertEq(data.dailyPoints, 500);
        assertEq(data.seasonSkills[0].skillLevels[0], 5);
        assertEq(data.equipment.length, 1);
    }

    function testUpdateDailyStats() public {
        // Create multiple heroes
        hero.createHero(NFT_CONTRACT, 2, "Hero2", HeroV6.Race.Human, HeroV6.Gender.Male);
        hero.createHero(NFT_CONTRACT, 3, "Hero3", HeroV6.Race.Human, HeroV6.Gender.Male);

        // Consume some energy and add points
        bytes memory energyData = abi.encode(50);
        bytes memory pointsData = abi.encode(500);

        for (uint256 i = 1; i <= 3; i++) {
            hero.saveHero(NFT_CONTRACT, i, 4, energyData);
            hero.saveHero(NFT_CONTRACT, i, 3, pointsData);
        }

        // Update daily stats
        hero.updateDailyStats();

        // Verify stats are reset
        for (uint256 i = 1; i <= 3; i++) {
            (,,,, uint256 energy, uint256 points) = hero.getHeroInfo(NFT_CONTRACT, i);
            assertEq(energy, 100);
            assertEq(points, 0);
        }
    }

    function testFailSaveInvalidHero() public {
        HeroV6.SaveBasicInfoParams memory params = HeroV6.SaveBasicInfoParams({
            name: "UpdatedHero",
            race: HeroV6.Race.Elf,
            gender: HeroV6.Gender.Female,
            level: 5
        });

        bytes memory data = abi.encode(params);
        hero.saveHero(NFT_CONTRACT, 999, 0, data); // Invalid token ID
    }

    function testFailSaveInvalidFunction() public {
        bytes memory data = "";
        hero.saveHero(NFT_CONTRACT, TOKEN_ID, 99, data); // Invalid function index
    }

    function testSaveHeroFullData() public {
        // Prepare test data
        HeroV6.Equipment[] memory equipment = new HeroV6.Equipment[](2);
        equipment[0] = HeroV6.Equipment({
            contractAddress: address(2),
            tokenId: 1,
            slot: 0
        });
        equipment[1] = HeroV6.Equipment({
            contractAddress: address(3),
            tokenId: 2,
            slot: 1
        });

        HeroV6.SeasonSkills[4] memory seasonSkills;
        // Set skills for Spring season
        seasonSkills[0].skillLevels = [10, 20, 30, 40, 50];
        // Set skills for Summer season
        seasonSkills[1].skillLevels = [15, 25, 35, 45, 55];
        // Set skills for Autumn season
        seasonSkills[2].skillLevels = [20, 30, 40, 50, 60];
        // Set skills for Winter season
        seasonSkills[3].skillLevels = [25, 35, 45, 55, 65];

        HeroV6.SaveHeroFullDataParams memory params = HeroV6.SaveHeroFullDataParams({
            name: "CompleteHero",
            race: HeroV6.Race.Elf,
            gender: HeroV6.Gender.Female,
            level: 10,
            energy: 80,
            dailyPoints: 500,
            seasonSkills: seasonSkills,
            equipment: equipment
        });

        // Save full hero data
        hero.saveHeroFullData(NFT_CONTRACT, TOKEN_ID, params);

        // Load and verify all data
        HeroV6.HeroFullData memory loadedData = hero.loadHero(NFT_CONTRACT, TOKEN_ID);

        // Verify basic info
        assertEq(loadedData.name, "CompleteHero");
        assertEq(uint8(loadedData.race), uint8(HeroV6.Race.Elf));
        assertEq(uint8(loadedData.gender), uint8(HeroV6.Gender.Female));
        assertEq(loadedData.level, 10);
        assertEq(loadedData.energy, 80);
        assertEq(loadedData.dailyPoints, 500);

        // Verify equipment
        assertEq(loadedData.equipment.length, 2);
        assertEq(loadedData.equipment[0].contractAddress, address(2));
        assertEq(loadedData.equipment[0].tokenId, 1);
        assertEq(loadedData.equipment[0].slot, 0);
        assertEq(loadedData.equipment[1].contractAddress, address(3));
        assertEq(loadedData.equipment[1].tokenId, 2);
        assertEq(loadedData.equipment[1].slot, 1);

        // Verify skills for all seasons
        for (uint8 i = 0; i < 4; i++) {
            for (uint8 j = 0; j < 5; j++) {
                assertEq(loadedData.seasonSkills[i].skillLevels[j], seasonSkills[i].skillLevels[j]);
            }
        }
    }

    function testFailSaveHeroFullDataInvalidEnergy() public {
        HeroV6.SeasonSkills[4] memory seasonSkills;
        // Initialize the fixed-size array properly
        for(uint8 i = 0; i < 4; i++) {
            for(uint8 j = 0; j < 5; j++) {
                seasonSkills[i].skillLevels[j] = 0;
            }
        }

        HeroV6.SaveHeroFullDataParams memory params = HeroV6.SaveHeroFullDataParams({
            name: "InvalidHero",
            race: HeroV6.Race.Elf,
            gender: HeroV6.Gender.Female,
            level: 10,
            energy: 101, // Invalid: exceeds MAX_DAILY_ENERGY
            dailyPoints: 500,
            seasonSkills: seasonSkills,
            equipment: new HeroV6.Equipment[](0)
        });

        hero.saveHeroFullData(NFT_CONTRACT, TOKEN_ID, params);
    }

    function testFailSaveHeroFullDataInvalidPoints() public {
        HeroV6.SeasonSkills[4] memory seasonSkills;
        // Initialize the fixed-size array properly
        for(uint8 i = 0; i < 4; i++) {
            for(uint8 j = 0; j < 5; j++) {
                seasonSkills[i].skillLevels[j] = 0;
            }
        }

        HeroV6.SaveHeroFullDataParams memory params = HeroV6.SaveHeroFullDataParams({
            name: "InvalidHero",
            race: HeroV6.Race.Elf,
            gender: HeroV6.Gender.Female,
            level: 10,
            energy: 80,
            dailyPoints: 1001, // Invalid: exceeds MAX_DAILY_POINTS
            seasonSkills: seasonSkills,
            equipment: new HeroV6.Equipment[](0)
        });

        hero.saveHeroFullData(NFT_CONTRACT, TOKEN_ID, params);
    }

    function testFailSaveHeroFullDataInvalidSkill() public {
        HeroV6.SeasonSkills[4] memory seasonSkills;
        seasonSkills[0].skillLevels = [101, 20, 30, 40, 50]; // Invalid: skill level exceeds 100

        HeroV6.SaveHeroFullDataParams memory params = HeroV6.SaveHeroFullDataParams({
            name: "InvalidHero",
            race: HeroV6.Race.Elf,
            gender: HeroV6.Gender.Female,
            level: 10,
            energy: 80,
            dailyPoints: 500,
            seasonSkills: seasonSkills,
            equipment: new HeroV6.Equipment[](0)
        });

        hero.saveHeroFullData(NFT_CONTRACT, TOKEN_ID, params);
    }

    function testComprehensiveSaveHero() public {
        // Test SAVE_BASIC_INFO (index 0)
        HeroV6.SaveBasicInfoParams memory basicParams = HeroV6.SaveBasicInfoParams({
            name: "UpdatedHero",
            race: HeroV6.Race.Elf,
            gender: HeroV6.Gender.Female,
            level: 5
        });
        bytes memory basicData = abi.encode(basicParams);
        hero.saveHero(NFT_CONTRACT, TOKEN_ID, 0, basicData);

        // Test SAVE_SKILLS (index 1)
        HeroV6.SaveSkillParams memory skillParams = HeroV6.SaveSkillParams({
            season: HeroV6.Season.Spring,
            skillIndex: 0,
            level: 10
        });
        bytes memory skillData = abi.encode(skillParams);
        hero.saveHero(NFT_CONTRACT, TOKEN_ID, 1, skillData);

        // Test SAVE_EQUIPMENT (index 2)
        HeroV6.SaveEquipmentParams memory equipParams = HeroV6.SaveEquipmentParams({
            slot: 0,
            equipContract: address(2),
            equipTokenId: 1
        });
        bytes memory equipData = abi.encode(equipParams);
        hero.saveHero(NFT_CONTRACT, TOKEN_ID, 2, equipData);

        // Test SAVE_DAILY_POINTS (index 3)
        uint256 points = 500;
        bytes memory pointsData = abi.encode(points);
        hero.saveHero(NFT_CONTRACT, TOKEN_ID, 3, pointsData);

        // Test SAVE_ENERGY (index 4)
        uint256 energy = 50;
        bytes memory energyData = abi.encode(energy);
        hero.saveHero(NFT_CONTRACT, TOKEN_ID, 4, energyData);

        // Verify all saved data
        HeroV6.HeroFullData memory data = hero.loadHero(NFT_CONTRACT, TOKEN_ID);
        
        // Verify basic info
        assertEq(data.name, "UpdatedHero");
        assertEq(uint8(data.race), uint8(HeroV6.Race.Elf));
        assertEq(uint8(data.gender), uint8(HeroV6.Gender.Female));
        assertEq(data.level, 5);
        
        // Verify skills
        assertEq(data.seasonSkills[uint8(HeroV6.Season.Spring)].skillLevels[0], 10);
        
        // Verify equipment
        assertEq(data.equipment.length, 1);
        assertEq(data.equipment[0].contractAddress, address(2));
        assertEq(data.equipment[0].tokenId, 1);
        assertEq(data.equipment[0].slot, 0);
        
        // Verify points and energy
        assertEq(data.dailyPoints, 500);
        assertEq(data.energy, 50);
    }

    function testFailSaveHeroInvalidIndex() public {
        bytes memory data = "";
        hero.saveHero(NFT_CONTRACT, TOKEN_ID, 5, data); // Invalid index
    }
} 