// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Hero} from "../src/core/Hero.sol";
import {HeroNFT} from "../src/core/HeroNFT.sol";
import {IHeroCore} from "../src/interfaces/IHeroCore.sol";

contract HeroTest is Test {
    Hero public hero;
    HeroNFT public heroNFT;
    address public owner;
    address public user;
    address public node;

    function setUp() public {
        owner = address(this);
        user = address(0x1);
        node = address(0x2);
        
        // 部署合约
        heroNFT = new HeroNFT();
        hero = new Hero();
        
        // 初始化合约
        heroNFT.initialize();
        hero.initialize(address(heroNFT));
        
        // 注册节点
        hero.registerNode(node);
        
        // 给测试用户一些 ETH
        vm.deal(user, 100 ether);
    }

    function testCreateHero() public {
        vm.startPrank(user);
        
        uint256 heroId = hero.createHero(1, "Test Hero", 1, 1);
        assertTrue(heroNFT.exists(heroId), "Hero NFT should exist");
        assertEq(heroNFT.ownerOf(heroId), user, "User should own the hero NFT");
        
        IHeroCore.HeroData memory data = hero.loadHero(heroId);
        assertEq(data.level, 1, "Initial level should be 1");
        assertEq(data.exp, 0, "Initial exp should be 0");
        
        vm.stopPrank();
    }

    function testLoadHero() public {
        vm.startPrank(user);
        
        uint256 heroId = hero.createHero(1, "Test Hero", 1, 1);
        IHeroCore.HeroData memory data = hero.loadHero(heroId);
        
        assertEq(data.id, heroId, "Hero ID should match");
        assertEq(data.level, 1, "Level should be 1");
        assertEq(data.exp, 0, "Exp should be 0");
        
        vm.stopPrank();
    }

    function testSaveHero() public {
        vm.startPrank(user);
        
        // 创建英雄
        uint256 heroId = hero.createHero(1, "Test Hero", 1, 1);
        IHeroCore.HeroData memory data = hero.loadHero(heroId);
        
        // 准备新数据
        IHeroCore.HeroData memory newData = IHeroCore.HeroData({
            id: heroId,
            level: 2,
            exp: 1000,
            createTime: data.createTime,
            lastSaveTime: uint32(block.timestamp),
            signature: ""
        });
        
        // 生成签名
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                heroId,
                newData.level,
                newData.exp,
                newData.createTime,
                newData.lastSaveTime
            )
        );
        
        // 节点签名
        vm.startPrank(node);
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(1, messageHash);
        bytes memory nodeSignature = abi.encodePacked(r1, s1, v1);
        vm.stopPrank();
        
        // 用户签名
        vm.startPrank(user);
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(2, messageHash);
        bytes memory clientSignature = abi.encodePacked(r2, s2, v2);
        
        // 保存数据
        hero.saveHero(heroId, newData, nodeSignature, clientSignature);
        
        // 验证保存结果
        IHeroCore.HeroData memory savedData = hero.loadHero(heroId);
        assertEq(savedData.level, 2, "Level should be updated to 2");
        assertEq(savedData.exp, 1000, "Exp should be updated to 1000");
        
        vm.stopPrank();
    }

    function testFailSaveHeroInvalidNodeSignature() public {
        vm.startPrank(user);
        
        // 创建英雄
        uint256 heroId = hero.createHero(1, "Test Hero", 1, 1);
        IHeroCore.HeroData memory data = hero.loadHero(heroId);
        
        // 准备新数据
        IHeroCore.HeroData memory newData = IHeroCore.HeroData({
            id: heroId,
            level: 2,
            exp: 1000,
            createTime: data.createTime,
            lastSaveTime: uint32(block.timestamp),
            signature: ""
        });
        
        // 使用未注册的节点签名
        vm.startPrank(address(0x3));
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                heroId,
                newData.level,
                newData.exp,
                newData.createTime,
                newData.lastSaveTime
            )
        );
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(1, messageHash);
        bytes memory nodeSignature = abi.encodePacked(r1, s1, v1);
        vm.stopPrank();
        
        // 用户签名
        vm.startPrank(user);
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(2, messageHash);
        bytes memory clientSignature = abi.encodePacked(r2, s2, v2);
        
        // 应该失败
        hero.saveHero(heroId, newData, nodeSignature, clientSignature);
    }
} 