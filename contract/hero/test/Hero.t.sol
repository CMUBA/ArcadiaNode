// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/core/Hero.sol";
import "../src/core/HeroNFT.sol";
import "../src/proxy/HeroProxy.sol";
import "./mocks/MockERC20.sol";
import {IHeroCore} from "../src/interfaces/IHeroCore.sol";

contract HeroTest is Test {
    Hero public hero;
    HeroNFT public heroNFT;
    MockERC20 public paymentToken;
    address public user;
    address public node;
    uint256 public constant NODE_PRIVATE_KEY = 2;
    uint256 public constant USER_PRIVATE_KEY = 1;

    uint256 public constant NATIVE_PRICE = 0.1 ether;
    uint256 public constant TOKEN_PRICE = 100 * 10**18;

    function setUp() public {
        // 设置用户和节点地址
        user = vm.addr(USER_PRIVATE_KEY);
        node = vm.addr(NODE_PRIVATE_KEY);
        vm.deal(user, 100 ether); // 给测试用户一些 ETH
        
        // 部署支付代币
        paymentToken = new MockERC20("Test Token", "TEST");
        
        // 部署 NFT 合约
        HeroNFT nftImpl = new HeroNFT();
        bytes memory nftInitData = abi.encodeWithSelector(
            HeroNFT.initialize.selector,
            address(paymentToken),
            NATIVE_PRICE,
            TOKEN_PRICE
        );
        HeroProxy nftProxy = new HeroProxy(
            address(nftImpl),
            nftInitData
        );
        heroNFT = HeroNFT(address(nftProxy));
        
        // 部署英雄合约
        Hero heroImpl = new Hero();
        bytes memory heroInitData = abi.encodeWithSelector(
            Hero.initialize.selector
        );
        HeroProxy heroProxy = new HeroProxy(
            address(heroImpl),
            heroInitData
        );
        hero = Hero(address(heroProxy));
        
        // 设置 NFT 合约地址
        hero.setNFTContract(address(heroNFT));

        // 注册节点
        hero.registerNode(node);
    }

    function testCreateHero() public {
        uint256 userId = 1;
        string memory name = "Test Hero";
        uint8 race = 0;
        uint8 class = 0;
        
        // 先用用户地址铸造 NFT
        uint256 tokenId = uint256(keccak256(abi.encodePacked(userId, name, race, class)));
        vm.prank(user);
        heroNFT.mint{value: NATIVE_PRICE}(user, tokenId);
        
        // 用用户地址创建英雄记录
        vm.prank(user);
        uint256 heroId = hero.createHero(userId, name, race, class);
        
        // 验证
        assertTrue(heroNFT.exists(heroId));
        assertEq(heroNFT.ownerOf(heroId), user); // NFT 应该属于用户
    }

    function testLoadHero() public {
        uint256 userId = 1;
        string memory name = "Test Hero";
        
        // 先用用户地址铸造 NFT
        uint256 tokenId = uint256(keccak256(abi.encodePacked(userId, name, uint8(0), uint8(0))));
        vm.prank(user);
        heroNFT.mint{value: NATIVE_PRICE}(user, tokenId);
        
        // 用用户地址创建英雄记录
        vm.prank(user);
        uint256 heroId = hero.createHero(userId, name, 0, 0);
        
        // 用用户地址加载英雄数据
        vm.prank(user);
        IHeroCore.HeroData memory data = hero.loadHero(heroId);
        assertEq(data.id, heroId);
        assertEq(data.level, 1);
        assertEq(data.exp, 0);
    }

    function testSaveHero() public {
        uint256 userId = 1;
        string memory name = "Test Hero";
        
        // 先用用户地址铸造 NFT
        uint256 tokenId = uint256(keccak256(abi.encodePacked(userId, name, uint8(0), uint8(0))));
        vm.prank(user);
        heroNFT.mint{value: NATIVE_PRICE}(user, tokenId);
        
        // 用用户地址创建英雄记录
        vm.prank(user);
        uint256 heroId = hero.createHero(userId, name, 0, 0);
        
        // 准备更新数据
        IHeroCore.HeroData memory data = IHeroCore.HeroData({
            id: heroId,
            level: 2,
            exp: 1000,
            createTime: uint32(block.timestamp),
            lastSaveTime: uint32(block.timestamp),
            signature: ""
        });

        // 生成节点签名
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                heroId,
                data.level,
                data.exp,
                data.createTime,
                data.lastSaveTime
            )
        );
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        // 使用节点的私钥签名
        (uint8 v1, bytes32 r1, bytes32 s1) = vm.sign(NODE_PRIVATE_KEY, ethSignedMessageHash);
        bytes memory nodeSignature = abi.encodePacked(r1, s1, v1);

        // 使用用户的私钥签名
        (uint8 v2, bytes32 r2, bytes32 s2) = vm.sign(USER_PRIVATE_KEY, ethSignedMessageHash);
        bytes memory clientSignature = abi.encodePacked(r2, s2, v2);

        // 用用户地址保存数据
        vm.prank(user);
        hero.saveHero(heroId, data, nodeSignature, clientSignature);

        // 用用户地址验证更新
        vm.prank(user);
        IHeroCore.HeroData memory updatedData = hero.loadHero(heroId);
        assertEq(updatedData.level, 2);
        assertEq(updatedData.exp, 1000);
    }

    function testNFTRegistration() public {
        // 测试添加NFT合约
        address newNFTContract = address(0x123);
        hero.addRegisteredNFT(newNFTContract);
        
        // 验证NFT合约已注册
        assertTrue(hero.isRegisteredNFT(newNFTContract));
        
        // 验证注册列表
        address[] memory registeredNFTs = hero.getRegisteredNFTs();
        assertEq(registeredNFTs.length, 1);
        assertEq(registeredNFTs[0], newNFTContract);
        
        // 测试移除NFT合约
        hero.removeRegisteredNFT(newNFTContract);
        
        // 验证NFT合约已移除
        assertFalse(hero.isRegisteredNFT(newNFTContract));
        
        // 验证注册列表为空
        registeredNFTs = hero.getRegisteredNFTs();
        assertEq(registeredNFTs.length, 0);
    }

    function testNFTRegistrationFailures() public {
        // 测试添加零地址
        vm.expectRevert("Invalid NFT contract address");
        hero.addRegisteredNFT(address(0));
        
        // 测试重复添加
        address newNFTContract = address(0x123);
        hero.addRegisteredNFT(newNFTContract);
        
        vm.expectRevert("NFT contract already registered");
        hero.addRegisteredNFT(newNFTContract);
        
        // 测试移除未注册的合约
        vm.expectRevert("NFT contract not registered");
        hero.removeRegisteredNFT(address(0x456));
    }

    function testHeroStats() public {
        uint256 userId = 1;
        string memory name = "Test Hero";
        uint8 race = 0;
        uint8 class = 0;
        
        // 铸造NFT并创建英雄
        uint256 tokenId = uint256(keccak256(abi.encodePacked(userId, name, race, class)));
        vm.prank(user);
        heroNFT.mint{value: NATIVE_PRICE}(user, tokenId);
        
        vm.prank(user);
        uint256 heroId = hero.createHero(userId, name, race, class);
        
        // 获取英雄状态
        (uint8 level, uint32 exp, uint32 createTime, uint32 lastSaveTime) = hero.getHeroStats(heroId);
        
        // 验证初始状态
        assertEq(level, 1);
        assertEq(exp, 0);
        assertEq(createTime, block.timestamp);
        assertEq(lastSaveTime, block.timestamp);
    }

    function testGetHerosByOwner() public {
        uint256 userId = 1;
        string memory name = "Test Hero";
        
        // 铸造两个NFT并创建英雄
        uint256 tokenId1 = uint256(keccak256(abi.encodePacked(userId, name, uint8(0), uint8(0))));
        uint256 tokenId2 = uint256(keccak256(abi.encodePacked(userId + 1, name, uint8(1), uint8(1))));
        
        vm.startPrank(user);
        heroNFT.mint{value: NATIVE_PRICE}(user, tokenId1);
        heroNFT.mint{value: NATIVE_PRICE}(user, tokenId2);
        
        hero.createHero(userId, name, 0, 0);
        hero.createHero(userId + 1, name, 1, 1);
        vm.stopPrank();
        
        // 获取用户的英雄列表
        uint256[] memory userHeroes = hero.getHerosByOwner(user);
        
        // 验证
        assertEq(userHeroes.length, 2);
        assertEq(userHeroes[0], tokenId1);
        assertEq(userHeroes[1], tokenId2);
    }

    receive() external payable {}
} 