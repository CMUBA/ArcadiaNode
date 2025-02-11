// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/core/HeroV5.sol";
import "../src/core/HeroNFT.sol";

contract HeroV5Test is Test {
    HeroV5 public hero;
    HeroNFT public nft;
    address public owner;
    address public user;

    function setUp() public {
        owner = address(this);
        user = address(0x1);
        
        // 部署合约
        hero = new HeroV5();
        
        // 部署NFT合约
        nft = new HeroNFT(address(0), 0.1 ether, 100 ether);
        
        // 注册NFT合约
        hero.registerNFT(address(nft), true);
        
        // 给用户一些测试代币
        vm.deal(user, 10 ether);
    }

    function testInitialState() public view {
        assertEq(hero.VERSION(), "5.0.0");
        assertEq(hero.officialNFT(), address(nft));
        assertTrue(hero.isRegistered(address(nft)));
    }

    function testCreateHero() public {
        // 创建英雄
        hero.createHero(
            address(nft),
            1,
            "Test Hero",
            HeroV5.Race.Human,
            HeroV5.Gender.Male
        );

        // 验证英雄信息
        (
            string memory name,
            HeroV5.Race race,
            HeroV5.Gender gender,
            uint256 level,
            uint256 energy,
            uint256 points
        ) = hero.getHeroInfo(address(nft), 1);

        assertEq(name, "Test Hero");
        assertEq(uint256(race), uint256(HeroV5.Race.Human));
        assertEq(uint256(gender), uint256(HeroV5.Gender.Male));
        assertEq(level, 1);
        assertEq(energy, hero.MAX_DAILY_ENERGY());
        assertEq(points, 0);
    }

    function testUpdateSkill() public {
        // 创建英雄
        hero.createHero(
            address(nft),
            1,
            "Test Hero",
            HeroV5.Race.Human,
            HeroV5.Gender.Male
        );

        // 更新技能
        hero.updateSkill(
            address(nft),
            1,
            HeroV5.Season.Spring,
            0,
            5
        );

        // 验证技能等级
        uint8[5] memory skills = hero.getHeroSkills(address(nft), 1, HeroV5.Season.Spring);
        assertEq(skills[0], 5);
    }

    function testEquipment() public {
        // 创建英雄
        hero.createHero(
            address(nft),
            1,
            "Test Hero",
            HeroV5.Race.Human,
            HeroV5.Gender.Male
        );

        // 添加装备
        address equipNFT = address(0x123);
        hero.updateEquipment(
            address(nft),
            1,
            0, // Weapon slot
            equipNFT,
            1
        );

        // 验证装备
        HeroV5.Equipment[] memory equipment = hero.getHeroEquipment(address(nft), 1);
        assertEq(equipment.length, 1);
        assertEq(equipment[0].contractAddress, equipNFT);
        assertEq(equipment[0].tokenId, 1);
        assertEq(equipment[0].slot, 0);
    }

    function testEnergySystem() public {
        // 创建英雄
        hero.createHero(
            address(nft),
            1,
            "Test Hero",
            HeroV5.Race.Human,
            HeroV5.Gender.Male
        );

        // 消耗能量
        hero.consumeEnergy(address(nft), 1, 50);

        // 验证能量值
        (,,,,uint256 energy,) = hero.getHeroInfo(address(nft), 1);
        assertEq(energy, 50);

        // 时间前进一天
        vm.warp(block.timestamp + 1 days);

        // 再次消耗能量，应该已经恢复
        hero.consumeEnergy(address(nft), 1, 50);
        (,,,,energy,) = hero.getHeroInfo(address(nft), 1);
        assertEq(energy, 50);
    }

    function testDailyPoints() public {
        // Create hero first
        hero.createHero(
            address(nft),
            1,
            "Test Hero",
            HeroV5.Race.Human,
            HeroV5.Gender.Male
        );

        // Add points
        hero.addDailyPoints(address(nft), 1, 500);

        // Verify points immediately
        (,,,,,uint256 points) = hero.getHeroInfo(address(nft), 1);
        assertEq(points, 500, "Points should be 500 immediately after adding");

        // Time travel exactly one day
        vm.warp(block.timestamp + 1 days);

        // Add points again to trigger the reset check
        hero.addDailyPoints(address(nft), 1, 300);

        // Verify points after adding new points
        (,,,,,points) = hero.getHeroInfo(address(nft), 1);
        assertEq(points, 300, "Points should be 300 after reset and adding new points");
    }
}