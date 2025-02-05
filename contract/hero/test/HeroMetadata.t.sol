// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {HeroMetadata} from "../src/core/HeroMetadata.sol";
import {HeroProxy} from "../src/proxy/HeroProxy.sol";
import {ProxyAdmin} from "../src/proxy/ProxyAdmin.sol";
import {IHeroMetadata} from "../src/interfaces/IHeroMetadata.sol";

contract HeroMetadataTest is Test {
    HeroMetadata public heroMetadata;
    HeroMetadata public implementation;
    ProxyAdmin public proxyAdmin;
    address public owner;

    function setUp() public {
        owner = address(this);
        
        // 部署合约
        vm.startPrank(owner);
        
        // 部署代理管理合约
        proxyAdmin = new ProxyAdmin();
        
        // 部署实现合约
        implementation = new HeroMetadata();
        
        // 准备初始化数据
        bytes memory initData = abi.encodeWithSelector(
            HeroMetadata.initialize.selector
        );
        
        // 部署代理合约
        HeroProxy proxy = new HeroProxy(
            address(implementation),
            initData
        );
        
        // 将代理合约包装为 HeroMetadata
        heroMetadata = HeroMetadata(address(proxy));
        
        vm.stopPrank();
    }

    function testSetAndGetSkill() public {
        vm.startPrank(owner);
        
        // 设置技能数据
        uint8 seasonId = uint8(IHeroMetadata.Season.Spring);
        uint8 skillId = 1;
        uint8 level = 1;
        string memory name = "Fireball";
        uint16 points = 100;
        
        heroMetadata.setSkill(seasonId, skillId, level, name, points, true);
        
        // 获取并验证技能数据
        IHeroMetadata.Skill memory skill = heroMetadata.getSkill(seasonId, skillId, level);
        
        assertEq(skill.name, name, "Skill name should match");
        assertEq(skill.level, level, "Skill level should match");
        assertEq(skill.points, points, "Skill points should match");
        assertEq(uint8(skill.season), seasonId, "Skill season should match");
        assertTrue(skill.isActive, "Skill should be active");
        
        vm.stopPrank();
    }

    function testSetAndGetRace() public {
        vm.startPrank(owner);
        
        // 设置种族数据
        uint8 raceId = uint8(IHeroMetadata.Race.Human);
        uint16[4] memory baseAttributes = [uint16(10), uint16(10), uint16(10), uint16(10)];
        string memory description = "Human race description";
        
        heroMetadata.setRace(raceId, baseAttributes, description, true);
        
        // 获取并验证种族数据
        IHeroMetadata.RaceAttributes memory race = heroMetadata.getRace(raceId);
        
        for(uint i = 0; i < 4; i++) {
            assertEq(race.baseAttributes[i], baseAttributes[i], "Race base attributes should match");
        }
        assertEq(race.description, description, "Race description should match");
        assertTrue(race.isActive, "Race should be active");
        
        vm.stopPrank();
    }

    function testSetAndGetClass() public {
        vm.startPrank(owner);
        
        // 设置职业数据
        uint8 classId = uint8(IHeroMetadata.Class.Warrior);
        uint16[4] memory baseAttributes = [uint16(12), uint16(15), uint16(20), uint16(18)];
        uint16[4] memory growthRates = [uint16(2), uint16(3), uint16(4), uint16(3)];
        string memory description = "Warrior class description";
        
        heroMetadata.setClass(classId, baseAttributes, growthRates, description, true);
        
        // 获取并验证职业数据
        IHeroMetadata.ClassAttributes memory class = heroMetadata.getClass(classId);
        
        for(uint i = 0; i < 4; i++) {
            assertEq(class.baseAttributes[i], baseAttributes[i], "Class base attributes should match");
            assertEq(class.growthRates[i], growthRates[i], "Class growth rates should match");
        }
        assertEq(class.description, description, "Class description should match");
        assertTrue(class.isActive, "Class should be active");
        
        vm.stopPrank();
    }

    function testFailUnauthorizedSetSkill() public {
        // 非所有者尝试设置技能
        vm.startPrank(address(0x1));
        
        heroMetadata.setSkill(0, 1, 1, "Test", 100, true);
    }

    function testFailUnauthorizedSetRace() public {
        // 非所有者尝试设置种族
        vm.startPrank(address(0x1));
        
        uint16[4] memory baseAttributes = [uint16(10), uint16(10), uint16(10), uint16(10)];
        heroMetadata.setRace(0, baseAttributes, "Test", true);
    }

    function testFailUnauthorizedSetClass() public {
        // 非所有者尝试设置职业
        vm.startPrank(address(0x1));
        
        uint16[4] memory baseAttributes = [uint16(10), uint16(10), uint16(10), uint16(10)];
        uint16[4] memory growthRates = [uint16(2), uint16(2), uint16(2), uint16(2)];
        heroMetadata.setClass(0, baseAttributes, growthRates, "Test", true);
    }
} 