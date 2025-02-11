// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

interface IHero {
    function initialize() external;
    function registerNFT(address nftContract, bool isOfficial) external;
    function unregisterNFT(address nftContract) external;
    function getRegisteredNFTs() external view returns (address[] memory);
    function isNFTRegistered(address nftContract) external view returns (bool);
    function getOfficialNFT() external view returns (address);
    function getRegisteredNFTCount() external view returns (uint256);
    function owner() external view returns (address);
}

contract TestHeroContractScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address heroNFTProxy = vm.envAddress("VITE_HERO_NFT_PROXY");
        
        IHero hero = IHero(heroProxy);
        
        console.log("====== Initial Contract State ======");
        console.log("Hero Proxy:", heroProxy);
        console.log("Hero NFT Proxy:", heroNFTProxy);
        console.log("Owner:", hero.owner());
        console.log("Official NFT:", hero.getOfficialNFT());
        console.log("Registered NFT Count:", hero.getRegisteredNFTCount());
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 测试注册官方NFT
        console.log("\n====== Register Official NFT ======");
        try hero.registerNFT(heroNFTProxy, true) {
            console.log("Successfully registered official NFT");
            
            try hero.isNFTRegistered(heroNFTProxy) returns (bool isRegistered) {
                console.log("Official NFT registration status:", isRegistered);
            } catch Error(string memory reason) {
                console.log("Failed to check official NFT registration:", reason);
            }
        } catch Error(string memory reason) {
            console.log("Failed to register official NFT:", reason);
        }
        
        // 测试注册社区NFT
        console.log("\n====== Register Community NFT ======");
        address testNFT = address(0x1234567890123456789012345678901234567890);
        
        try hero.registerNFT(testNFT, false) {
            console.log("Successfully registered community NFT");
            
            try hero.isNFTRegistered(testNFT) returns (bool isRegistered) {
                console.log("Community NFT registration status:", isRegistered);
            } catch Error(string memory reason) {
                console.log("Failed to check community NFT registration:", reason);
            }
        } catch Error(string memory reason) {
            console.log("Failed to register community NFT:", reason);
        }
        
        // 获取所有注册的NFT
        console.log("\n====== Registered NFTs ======");
        try hero.getRegisteredNFTs() returns (address[] memory nfts) {
            console.log("Total registered NFTs:", nfts.length);
            for (uint i = 0; i < nfts.length; i++) {
                console.log("NFT", i, ":", nfts[i]);
            }
        } catch Error(string memory reason) {
            console.log("Failed to get registered NFTs:", reason);
        }
        
        vm.stopBroadcast();
    }
}