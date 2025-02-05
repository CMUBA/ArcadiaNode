// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {HeroNFT} from "../src/core/HeroNFT.sol";
import {HeroProxy} from "../src/proxy/HeroProxy.sol";
import {ProxyAdmin} from "../src/proxy/ProxyAdmin.sol";

contract HeroNFTTest is Test {
    HeroNFT public heroNFT;
    HeroNFT public implementation;
    ProxyAdmin public proxyAdmin;
    address public owner;
    address public user;

    function setUp() public {
        owner = address(this);
        user = address(0x1);
        
        // 部署合约
        vm.startPrank(owner);
        
        // 部署代理管理合约
        proxyAdmin = new ProxyAdmin();
        
        // 部署实现合约
        implementation = new HeroNFT();
        
        // 准备初始化数据
        bytes memory initData = abi.encodeWithSelector(
            HeroNFT.initialize.selector
        );
        
        // 部署代理合约
        HeroProxy proxy = new HeroProxy(
            address(implementation),
            initData
        );
        
        // 将代理合约包装为 HeroNFT
        heroNFT = HeroNFT(address(proxy));
        
        vm.stopPrank();
        
        // 给测试用户一些 ETH
        vm.deal(user, 100 ether);
    }

    function testMint() public {
        vm.startPrank(owner);
        uint256 tokenId = 1;
        heroNFT.mint(user, tokenId);
        vm.stopPrank();
        
        assertEq(heroNFT.ownerOf(tokenId), user, "User should own the NFT");
        assertTrue(heroNFT.exists(tokenId), "Token should exist");
    }

    function testMintBatch() public {
        vm.startPrank(owner);
        uint256[] memory tokenIds = new uint256[](3);
        tokenIds[0] = 1;
        tokenIds[1] = 2;
        tokenIds[2] = 3;
        
        heroNFT.mintBatch(user, tokenIds);
        vm.stopPrank();
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            assertEq(heroNFT.ownerOf(tokenIds[i]), user, "User should own the NFT");
            assertTrue(heroNFT.exists(tokenIds[i]), "Token should exist");
        }
    }

    function testBurn() public {
        vm.startPrank(owner);
        uint256 tokenId = 1;
        heroNFT.mint(user, tokenId);
        vm.stopPrank();
        
        vm.startPrank(user);
        heroNFT.burn(tokenId);
        vm.stopPrank();
        
        assertFalse(heroNFT.exists(tokenId), "Token should not exist after burning");
    }

    function testFailBurnUnauthorized() public {
        vm.startPrank(owner);
        uint256 tokenId = 1;
        heroNFT.mint(user, tokenId);
        vm.stopPrank();
        
        // 未授权的地址尝试销毁 NFT
        vm.startPrank(address(0x2));
        heroNFT.burn(tokenId);
    }

    function testIsApprovedForToken() public {
        vm.startPrank(owner);
        uint256 tokenId = 1;
        address operator = address(0x2);
        
        heroNFT.mint(user, tokenId);
        vm.stopPrank();
        
        vm.startPrank(user);
        heroNFT.approve(operator, tokenId);
        vm.stopPrank();
        
        assertTrue(
            heroNFT.isApprovedForToken(operator, tokenId),
            "Operator should be approved for token"
        );
    }

    function testFailMintUnauthorized() public {
        uint256 tokenId = 1;
        
        // 非所有者尝试铸造 NFT
        vm.startPrank(user);
        heroNFT.mint(user, tokenId);
    }
} 