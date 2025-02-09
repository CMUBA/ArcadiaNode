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
        
        // Deploy payment token
        paymentToken = new MockERC20("Test Token", "TEST");
        
        // Deploy HeroNFT with proxy
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
        
        // Deploy Hero with proxy
        Hero heroImpl = new Hero();
        bytes memory heroInitData = abi.encodeWithSelector(
            Hero.initialize.selector
        );
        HeroProxy heroProxy = new HeroProxy(
            address(heroImpl),
            heroInitData
        );
        hero = Hero(address(heroProxy));
        
        // Register HeroNFT as official NFT
        hero.registerNFT(address(heroNFT), true);
    }
    
    function testNFTRegistration() public {
        assertTrue(hero.isNFTRegistered(address(heroNFT)));
        assertEq(hero.getOfficialNFT(), address(heroNFT));
    }
    
    function testRegisterCommunityNFT() public {
        address communityNFT = address(0x1234);
        hero.registerNFT(communityNFT, false);
        
        assertTrue(hero.isNFTRegistered(communityNFT));
        assertNotEq(hero.getOfficialNFT(), communityNFT);
    }
    
    function testUnregisterNFT() public {
        address communityNFT = address(0x1234);
        hero.registerNFT(communityNFT, false);
        hero.unregisterNFT(communityNFT);
        
        assertFalse(hero.isNFTRegistered(communityNFT));
    }
    
    function testCannotUnregisterOfficialNFT() public {
        vm.expectRevert("Cannot unregister official NFT");
        hero.unregisterNFT(address(heroNFT));
    }
}