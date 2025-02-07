// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {HeroNFT} from "../src/core/HeroNFT.sol";
import {IHeroNFT} from "../src/interfaces/IHeroNFT.sol";
import {HeroProxy} from "../src/proxy/HeroProxy.sol";
import {ProxyAdmin} from "../src/proxy/ProxyAdmin.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract HeroNFTTest is Test {
    HeroNFT public heroNFT;
    HeroNFT public implementation;
    ProxyAdmin public proxyAdmin;
    MockERC20 public paymentToken;
    address public owner;
    address public user;

    uint256 public constant NATIVE_PRICE = 0.1 ether;
    uint256 public constant TOKEN_PRICE = 100 * 10**18;

    function setUp() public {
        owner = address(this);
        user = address(0x1);
        
        // 部署支付token
        paymentToken = new MockERC20("Payment Token", "PAY");
        
        // 部署合约
        vm.startPrank(owner);
        
        // 部署代理管理合约
        proxyAdmin = new ProxyAdmin();
        
        // 部署实现合约
        implementation = new HeroNFT();
        
        // 准备初始化数据
        bytes memory initData = abi.encodeWithSelector(
            HeroNFT.initialize.selector,
            address(paymentToken),
            NATIVE_PRICE,
            TOKEN_PRICE
        );
        
        // 部署代理合约
        HeroProxy proxy = new HeroProxy(
            address(implementation),
            initData
        );
        
        // 将代理合约包装为 HeroNFT
        heroNFT = HeroNFT(address(proxy));
        
        vm.stopPrank();
        
        // 给测试用户一些 ETH 和 token
        vm.deal(user, 100 ether);
        paymentToken.mint(user, 1000 * 10**18);
    }

    function testMintWithNative() public {
        vm.startPrank(user);
        uint256 tokenId = 1;
        heroNFT.mint{value: NATIVE_PRICE}(user, tokenId);
        vm.stopPrank();
        
        assertEq(heroNFT.ownerOf(tokenId), user);
        assertTrue(heroNFT.exists(tokenId));
    }

    function testMintWithToken() public {
        vm.startPrank(user);
        uint256 tokenId = 1;
        
        // 授权转账
        paymentToken.approve(address(heroNFT), TOKEN_PRICE);
        
        // 铸造NFT
        heroNFT.mintWithToken(user, tokenId, address(paymentToken));
        vm.stopPrank();
        
        assertEq(heroNFT.ownerOf(tokenId), user);
        assertTrue(heroNFT.exists(tokenId));
        assertEq(paymentToken.balanceOf(address(heroNFT)), TOKEN_PRICE);
    }

    function testMintBatchWithNative() public {
        vm.startPrank(user);
        uint256[] memory tokenIds = new uint256[](3);
        tokenIds[0] = 1;
        tokenIds[1] = 2;
        tokenIds[2] = 3;
        
        heroNFT.mintBatch{value: NATIVE_PRICE * 3}(user, tokenIds);
        vm.stopPrank();
        
        for(uint256 i = 0; i < tokenIds.length; i++) {
            assertEq(heroNFT.ownerOf(tokenIds[i]), user);
            assertTrue(heroNFT.exists(tokenIds[i]));
        }
    }

    function testMintBatchWithToken() public {
        vm.startPrank(user);
        uint256[] memory tokenIds = new uint256[](3);
        tokenIds[0] = 1;
        tokenIds[1] = 2;
        tokenIds[2] = 3;
        
        // 授权转账
        paymentToken.approve(address(heroNFT), TOKEN_PRICE * 3);
        
        // 铸造NFT
        heroNFT.mintBatchWithToken(user, tokenIds, address(paymentToken));
        vm.stopPrank();
        
        for(uint256 i = 0; i < tokenIds.length; i++) {
            assertEq(heroNFT.ownerOf(tokenIds[i]), user);
            assertTrue(heroNFT.exists(tokenIds[i]));
        }
        assertEq(paymentToken.balanceOf(address(heroNFT)), TOKEN_PRICE * 3);
    }

    function testSetPriceConfig() public {
        uint256 tokenId = 1;
        address customToken = address(0x2);
        uint256 customPrice = 2 ether;
        
        vm.prank(owner);
        heroNFT.setPriceConfig(tokenId, customToken, customPrice);
        
        IHeroNFT.PriceConfig memory config = heroNFT.getPriceConfig(tokenId);
        assertEq(config.tokenAddress, customToken);
        assertEq(config.price, customPrice);
        assertTrue(config.isActive);
    }

    function testFailMintWithInsufficientNative() public {
        vm.prank(user);
        heroNFT.mint{value: NATIVE_PRICE - 1}(user, 1);
    }

    function testFailMintWithInvalidToken() public {
        vm.startPrank(user);
        paymentToken.approve(address(heroNFT), TOKEN_PRICE);
        heroNFT.mintWithToken(user, 1, address(0));
        vm.stopPrank();
    }

    function testFailUnauthorizedSetPriceConfig() public {
        vm.prank(user);
        heroNFT.setPriceConfig(1, address(0), 1 ether);
    }

    function testPause() public {
        vm.prank(owner);
        heroNFT.pause();
        
        vm.startPrank(user);
        vm.expectRevert("Pausable: paused");
        heroNFT.mint{value: NATIVE_PRICE}(user, 1);
        vm.stopPrank();
    }

    function testBurn() public {
        // 先铸造
        vm.prank(user);
        heroNFT.mint{value: NATIVE_PRICE}(user, 1);
        
        // 然后销毁
        vm.prank(user);
        heroNFT.burn(1);
        
        assertFalse(heroNFT.exists(1));
    }

    function testFailBurnUnauthorized() public {
        // 先铸造
        vm.prank(user);
        heroNFT.mint{value: NATIVE_PRICE}(user, 1);
        
        // 其他用户尝试销毁
        vm.prank(address(0x3));
        heroNFT.burn(1);
    }
} 