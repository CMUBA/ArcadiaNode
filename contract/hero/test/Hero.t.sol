// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {Hero} from "../src/core/Hero.sol";
import {HeroNFT} from "../src/core/HeroNFT.sol";
import {HeroProxy} from "../src/proxy/HeroProxy.sol";
import {ProxyAdmin} from "../src/proxy/ProxyAdmin.sol";
import {IHeroCore} from "../src/interfaces/IHeroCore.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract HeroTest is Test {
    using ECDSA for bytes32;

    Hero public hero;
    HeroNFT public heroNFT;
    ProxyAdmin public proxyAdmin;
    address public owner;
    address public user;
    address public node;
    uint256 public constant NODE_PRIVATE_KEY = 1;
    uint256 public constant USER_PRIVATE_KEY = 2;

    function setUp() public {
        owner = address(this);
        user = vm.addr(USER_PRIVATE_KEY);
        node = vm.addr(NODE_PRIVATE_KEY);
        
        // 部署合约
        vm.startPrank(owner);
        
        // 部署代理管理合约
        proxyAdmin = new ProxyAdmin();
        
        // 部署 Hero 实现合约
        Hero heroImplementation = new Hero();
        
        // 部署 NFT 实现合约
        HeroNFT nftImplementation = new HeroNFT();
        
        // 先部署 Hero 代理合约（不初始化）
        bytes memory emptyData = "";
        HeroProxy heroProxy = new HeroProxy(
            address(heroImplementation),
            emptyData
        );
        hero = Hero(address(heroProxy));
        
        // 部署 NFT 代理合约并初始化
        bytes memory nftInitData = abi.encodeWithSelector(
            HeroNFT.initialize.selector
        );
        HeroProxy nftProxy = new HeroProxy(
            address(nftImplementation),
            nftInitData
        );
        heroNFT = HeroNFT(address(nftProxy));
        
        // 将 NFT 合约的所有权转移给 Hero 合约
        heroNFT.transferOwnership(address(hero));
        
        // 初始化 Hero 合约
        hero.initialize(address(heroNFT));
        
        // 注册节点
        hero.registerNode(node);
        vm.stopPrank();
        
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
        
        // 生成消息哈希
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                heroId,
                newData.level,
                newData.exp,
                newData.createTime,
                newData.lastSaveTime
            )
        ).toEthSignedMessageHash();
        vm.stopPrank();
        
        // 节点签名
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(NODE_PRIVATE_KEY, messageHash);
        bytes memory nodeSignature = abi.encodePacked(r1, s1, v1);
        
        // 用户签名
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(USER_PRIVATE_KEY, messageHash);
        bytes memory clientSignature = abi.encodePacked(r2, s2, v2);
        
        vm.startPrank(user);
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
        
        // 生成消息哈希
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                heroId,
                newData.level,
                newData.exp,
                newData.createTime,
                newData.lastSaveTime
            )
        ).toEthSignedMessageHash();
        vm.stopPrank();
        
        // 使用未注册的节点签名
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(3, messageHash);
        bytes memory nodeSignature = abi.encodePacked(r1, s1, v1);
        
        // 用户签名
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(USER_PRIVATE_KEY, messageHash);
        bytes memory clientSignature = abi.encodePacked(r2, s2, v2);
        
        vm.startPrank(user);
        // 应该失败
        hero.saveHero(heroId, newData, nodeSignature, clientSignature);
        vm.stopPrank();
    }
} 