// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroV2.sol";
import "../src/proxy/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract CheckStateScript is Script {
    function run() external view {
        address proxyAdmin = vm.envAddress("VITE_PROXY_ADMIN");
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address heroImpl = vm.envAddress("VITE_HERO_IMPLEMENTATION");
        address deployer = vm.addr(uint256(vm.envBytes32("HERO_PRIVATE_KEY")));
        
        console.log("\nAddresses:");
        console.log("ProxyAdmin:", proxyAdmin);
        console.log("Hero Proxy:", heroProxy);
        console.log("Hero Implementation:", heroImpl);
        console.log("Deployer:", deployer);
        
        // 检查合约状态
        HeroV2 hero = HeroV2(heroProxy);
        
        // 检查版本
        try hero.VERSION() returns (string memory version) {
            console.log("\nContract version:", version);
        } catch {
            console.log("\nFailed to get version");
        }
        
        // 检查所有者
        try hero.owner() returns (address owner) {
            console.log("\nContract owner:", owner);
            console.log("Is deployer the owner?", owner == deployer);
        } catch {
            console.log("\nFailed to get owner");
        }
        
        // 检查官方 NFT
        try hero.officialNFT() returns (address nft) {
            console.log("\nOfficial NFT:", nft);
        } catch {
            console.log("\nFailed to get official NFT");
        }
        
        // 检查已注册的 NFT
        try hero.getRegisteredNFTs() returns (address[] memory nfts) {
            console.log("\nRegistered NFTs:");
            for (uint i = 0; i < nfts.length; i++) {
                console.log(nfts[i]);
            }
        } catch {
            console.log("\nFailed to get registered NFTs");
        }
    }
}
