// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {HeroNFT} from "../src/core/HeroNFT.sol";
import {IHeroNFT} from "../src/interfaces/IHeroNFT.sol";
import {MockERC20} from "./mocks/MockERC20.sol";

contract HeroNFTTest is Test {
    HeroNFT public heroNFT;
    MockERC20 public paymentToken;
    address public owner;
    address public user;

    uint256 public constant NATIVE_PRICE = 0.1 ether;
    uint256 public constant TOKEN_PRICE = 100 * 10**18;

    function setUp() public {
        owner = address(this);
        user = address(0x1);
        
        // Deploy payment token
        paymentToken = new MockERC20("Payment Token", "PAY");
        
        // Deploy HeroNFT with constructor parameters
        heroNFT = new HeroNFT(
            address(paymentToken),
            NATIVE_PRICE,
            TOKEN_PRICE
        );
        
        // Give test user some ETH and tokens
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
        
        // Approve token transfer
        paymentToken.approve(address(heroNFT), TOKEN_PRICE);
        
        // Mint NFT
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
        
        // Approve token transfer
        paymentToken.approve(address(heroNFT), TOKEN_PRICE * 3);
        
        // Mint NFTs
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

    function testBurn() public {
        // First mint
        vm.prank(user);
        heroNFT.mint{value: NATIVE_PRICE}(user, 1);
        
        // Then burn
        vm.prank(user);
        heroNFT.burn(1);
        
        assertFalse(heroNFT.exists(1));
    }

    function testFailBurnUnauthorized() public {
        // First mint
        vm.prank(user);
        heroNFT.mint{value: NATIVE_PRICE}(user, 1);
        
        // Another user tries to burn
        vm.prank(address(0x3));
        heroNFT.burn(1);
    }
} 