// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/core/HeroV6.sol";
import "../src/core/HeroNFT.sol";

contract MockNFT {
    mapping(uint256 => address) private _owners;
    
    function mint(address to, uint256 tokenId) external {
        _owners[tokenId] = to;
    }
    
    function ownerOf(uint256 tokenId) external view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "ERC721: invalid token ID");
        return owner;
    }
}

contract HeroV6Test is Test {
    HeroV6 public hero;
    MockNFT public nft;
    address public constant OWNER = address(1);
    uint256 public constant TOKEN_ID = 1;

    function setUp() public {
        // Deploy contracts
        vm.startPrank(OWNER);
        hero = new HeroV6();
        nft = new MockNFT();
        
        // Register NFT contract
        hero.registerNFT(address(nft), true);
        
        // Mint NFT to owner
        nft.mint(OWNER, TOKEN_ID);
        
        // Create hero as owner
        hero.createHero(address(nft), TOKEN_ID, "TestHero", HeroV6.Race.Human, HeroV6.Gender.Male);
        vm.stopPrank();
    }

    function testCreateHero() public {
        (
            string memory name,
            HeroV6.Race race,
            HeroV6.Gender gender,
            uint256 level,
            uint256 energy,
            uint256 dailyPoints
        ) = hero.getHeroInfo(address(nft), TOKEN_ID);

        assertEq(name, "TestHero");
        assertEq(uint8(race), uint8(HeroV6.Race.Human));
        assertEq(uint8(gender), uint8(HeroV6.Gender.Male));
        assertEq(level, 1);
        assertEq(energy, 100);
        assertEq(dailyPoints, 0);
    }

    function testCreateHeroProcess() public {
        // Create new NFT and token ID
        uint256 newTokenId = 999;
        
        vm.startPrank(OWNER);
        
        // Mint new NFT
        nft.mint(OWNER, newTokenId);
        
        // Verify NFT ownership
        assertEq(nft.ownerOf(newTokenId), OWNER);
        
        // Create hero
        hero.createHero(
            address(nft),
            newTokenId,
            "New Test Hero",
            HeroV6.Race.Elf,
            HeroV6.Gender.Female
        );
        
        // Verify hero creation
        (
            string memory name,
            HeroV6.Race race,
            HeroV6.Gender gender,
            uint256 level,
            uint256 energy,
            uint256 dailyPoints
        ) = hero.getHeroInfo(address(nft), newTokenId);
        
        assertEq(name, "New Test Hero");
        assertEq(uint8(race), uint8(HeroV6.Race.Elf));
        assertEq(uint8(gender), uint8(HeroV6.Gender.Female));
        assertEq(level, 1);
        assertEq(energy, 100);
        assertEq(dailyPoints, 0);
        
        vm.stopPrank();
    }

    function testFailCreateHeroNotOwner() public {
        // Create a new address that doesn't own the NFT
        address nonOwner = address(0x123);
        
        // Mint new NFT to owner
        nft.mint(OWNER, 2);
        
        // Try to create hero from non-owner address (should fail)
        vm.prank(nonOwner);
        hero.createHero(
            address(nft),
            2,
            "Failed Hero",
            HeroV6.Race.Human,
            HeroV6.Gender.Male
        );
    }

    function testCreateHeroAsOwner() public {
        // Mint new NFT
        uint256 newTokenId = 3;
        nft.mint(OWNER, newTokenId);
        
        // Create hero as NFT owner
        vm.prank(OWNER);
        hero.createHero(
            address(nft),
            newTokenId,
            "Owner Hero",
            HeroV6.Race.Human,
            HeroV6.Gender.Male
        );

        // Verify hero was created
        (
            string memory name,
            HeroV6.Race race,
            HeroV6.Gender gender,
            uint256 level,
            ,
            
        ) = hero.getHeroInfo(address(nft), newTokenId);

        assertEq(name, "Owner Hero");
        assertEq(uint8(race), uint8(HeroV6.Race.Human));
        assertEq(uint8(gender), uint8(HeroV6.Gender.Male));
        assertEq(level, 1);
    }

    function testSaveBasicInfo() public {
        HeroV6.SaveBasicInfoParams memory params = HeroV6.SaveBasicInfoParams({
            name: "UpdatedHero",
            race: HeroV6.Race.Elf,
            gender: HeroV6.Gender.Female,
            level: 5
        });

        bytes memory data = abi.encode(params);
        vm.startPrank(OWNER);
        hero.saveHero(address(nft), TOKEN_ID, 0, data);
        vm.stopPrank();

        (
            string memory name,
            HeroV6.Race race,
            HeroV6.Gender gender,
            uint256 level,
            ,
            
        ) = hero.getHeroInfo(address(nft), TOKEN_ID);

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
        vm.startPrank(OWNER);
        hero.saveHero(address(nft), TOKEN_ID, 1, data);
        vm.stopPrank();

        uint8[5] memory skills = hero.getHeroSkills(address(nft), TOKEN_ID, HeroV6.Season.Spring);
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
        vm.startPrank(OWNER);
        hero.saveHero(address(nft), TOKEN_ID, 2, data);
        vm.stopPrank();

        HeroV6.Equipment[] memory equipment = hero.getHeroEquipment(address(nft), TOKEN_ID);
        assertEq(equipment.length, 1);
        assertEq(equipment[0].contractAddress, equipContract);
        assertEq(equipment[0].tokenId, equipTokenId);
        assertEq(equipment[0].slot, 0);
    }

    function testSaveDailyPoints() public {
        uint256 points = 500;
        bytes memory data = abi.encode(points);
        vm.startPrank(OWNER);
        hero.saveHero(address(nft), TOKEN_ID, 3, data);
        vm.stopPrank();

        (,,,,, uint256 dailyPoints) = hero.getHeroInfo(address(nft), TOKEN_ID);
        assertEq(dailyPoints, points);
    }

    function testSaveEnergy() public {
        uint256 energyToConsume = 50;
        bytes memory data = abi.encode(energyToConsume);
        vm.startPrank(OWNER);
        hero.saveHero(address(nft), TOKEN_ID, 4, data);
        vm.stopPrank();

        (,,,, uint256 energy,) = hero.getHeroInfo(address(nft), TOKEN_ID);
        assertEq(energy, 50); // 100 - 50
    }

    function testLoadHero() public {
        vm.startPrank(OWNER);
        
        // Save basic info
        HeroV6.SaveBasicInfoParams memory basicParams = HeroV6.SaveBasicInfoParams({
            name: "UpdatedHero",
            race: HeroV6.Race.Elf,
            gender: HeroV6.Gender.Female,
            level: 5
        });
        bytes memory basicData = abi.encode(basicParams);
        hero.saveHero(address(nft), TOKEN_ID, 0, basicData);

        // Save skills
        HeroV6.SaveSkillParams memory skillParams = HeroV6.SaveSkillParams({
            season: HeroV6.Season.Spring,
            skillIndex: 0,
            level: 5
        });
        bytes memory skillData = abi.encode(skillParams);
        hero.saveHero(address(nft), TOKEN_ID, 1, skillData);

        // Save equipment
        HeroV6.SaveEquipmentParams memory equipParams = HeroV6.SaveEquipmentParams({
            slot: 0,
            equipContract: address(2),
            equipTokenId: 1
        });
        bytes memory equipData = abi.encode(equipParams);
        hero.saveHero(address(nft), TOKEN_ID, 2, equipData);

        // Save daily points
        uint256 points = 500;
        bytes memory pointsData = abi.encode(points);
        hero.saveHero(address(nft), TOKEN_ID, 3, pointsData);

        // Save energy
        uint256 energyToConsume = 50;
        bytes memory energyData = abi.encode(energyToConsume);
        hero.saveHero(address(nft), TOKEN_ID, 4, energyData);

        // Load and verify all data
        HeroV6.HeroFullData memory data = hero.loadHero(address(nft), TOKEN_ID);
        vm.stopPrank();

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
        uint256[] memory tokenIds = new uint256[](3);
        tokenIds[0] = TOKEN_ID;
        tokenIds[1] = 2;
        tokenIds[2] = 3;

        vm.startPrank(OWNER);
        // Mint NFTs and create heroes
        for (uint256 i = 1; i < tokenIds.length; i++) {
            nft.mint(OWNER, tokenIds[i]);
            hero.createHero(
                address(nft),
                tokenIds[i],
                string(abi.encodePacked("Hero", tokenIds[i])),
                HeroV6.Race.Human,
                HeroV6.Gender.Male
            );
        }

        // Consume energy and add points for all heroes
        bytes memory energyData = abi.encode(50);
        bytes memory pointsData = abi.encode(500);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            hero.saveHero(address(nft), tokenIds[i], 4, energyData);
            hero.saveHero(address(nft), tokenIds[i], 3, pointsData);
        }

        // Update daily stats
        hero.updateDailyStats();
        vm.stopPrank();

        // Verify stats are reset
        for (uint256 i = 0; i < tokenIds.length; i++) {
            (,,,, uint256 energy, uint256 points) = hero.getHeroInfo(address(nft), tokenIds[i]);
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
        vm.prank(OWNER);
        hero.saveHero(address(nft), 999, 0, data); // Invalid token ID
    }

    function testFailSaveInvalidFunction() public {
        bytes memory data = "";
        vm.prank(OWNER);
        hero.saveHero(address(nft), TOKEN_ID, 99, data); // Invalid function index
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
        // Set skills for all seasons
        for(uint8 i = 0; i < 4; i++) {
            for(uint8 j = 0; j < 5; j++) {
                seasonSkills[i].skillLevels[j] = uint8((i + 1) * 10 + j * 5);
            }
        }

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
        vm.startPrank(OWNER);
        hero.saveHeroFullData(address(nft), TOKEN_ID, params);

        // Load and verify all data
        HeroV6.HeroFullData memory loadedData = hero.loadHero(address(nft), TOKEN_ID);
        vm.stopPrank();

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

        vm.prank(OWNER);
        hero.saveHeroFullData(address(nft), TOKEN_ID, params);
    }

    function testFailSaveHeroFullDataInvalidPoints() public {
        HeroV6.SeasonSkills[4] memory seasonSkills;
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

        vm.prank(OWNER);
        hero.saveHeroFullData(address(nft), TOKEN_ID, params);
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

        vm.prank(OWNER);
        hero.saveHeroFullData(address(nft), TOKEN_ID, params);
    }
} 