// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/core/Hero.sol";
import "../src/core/HeroNFT.sol";
import "../src/proxy/HeroProxy.sol";
import "./mocks/MockERC20.sol";

contract HeroTest is Test {
    Hero public hero;
    HeroNFT public heroNFT;
    MockERC20 public paymentToken;
    address owner;
    
    uint256 public constant NATIVE_PRICE = 0.1 ether;
    uint256 public constant TOKEN_PRICE = 100 * 10**18;
    
    function setUp() public {
        owner = address(this);
        
        // Deploy contracts
        vm.startPrank(owner);
        
        // Deploy payment token
        paymentToken = new MockERC20("Test Token", "TEST");
        
        // Deploy HeroNFT
        heroNFT = new HeroNFT(
            address(0),  // default token
            0.1 ether,  // native price
            100 ether   // token price
        );
        
        // Deploy Hero and transfer ownership
        hero = new Hero();
        
        vm.stopPrank();
    }
    
    function testNFTRegistration() public {
        vm.startPrank(owner);
        hero.registerNFT(address(heroNFT), true);
        vm.stopPrank();
        
        assertTrue(hero.isNFTRegistered(address(heroNFT)));
        assertEq(hero.getOfficialNFT(), address(heroNFT));
    }
    
    function testRegisterCommunityNFT() public {
        // First register the official NFT
        vm.startPrank(owner);
        hero.registerNFT(address(heroNFT), true);
        
        // Then register a community NFT
        address communityNFT = address(0x1234);
        hero.registerNFT(communityNFT, false);
        vm.stopPrank();
        
        assertTrue(hero.isNFTRegistered(communityNFT));
        assertNotEq(hero.getOfficialNFT(), communityNFT);
        assertEq(hero.getOfficialNFT(), address(heroNFT));
    }
    
    function testUnregisterNFT() public {
        address communityNFT = address(0x1234);
        
        vm.startPrank(owner);
        hero.registerNFT(communityNFT, false);
        hero.unregisterNFT(communityNFT);
        vm.stopPrank();
        
        assertFalse(hero.isNFTRegistered(communityNFT));
    }
    
    function testCannotUnregisterOfficialNFT() public {
        vm.startPrank(owner);
        hero.registerNFT(address(heroNFT), true);
        vm.expectRevert("Cannot unregister official NFT");
        hero.unregisterNFT(address(heroNFT));
        vm.stopPrank();
    }
}