// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/Hero.sol";
import "../src/core/HeroNFT.sol";
import "../src/core/HeroMetadata.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract CheckOwnershipScript is Script {
    function run() external view {
        address proxyAdmin = vm.envAddress("VITE_PROXY_ADMIN");
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address heroNFTProxy = vm.envAddress("VITE_HERO_NFT_PROXY");
        address heroMetadataProxy = vm.envAddress("VITE_HERO_METADATA_PROXY");
        
        // 检查 ProxyAdmin 的所有者
        ProxyAdmin admin = ProxyAdmin(proxyAdmin);
        address proxyAdminOwner = admin.owner();
        console.log("\nProxyAdmin Contract:", address(admin));
        console.log("Owner:", proxyAdminOwner);
        
        // 检查实现合约的所有者
        Hero hero = Hero(heroProxy);
        HeroNFT nft = HeroNFT(heroNFTProxy);
        HeroMetadata metadata = HeroMetadata(heroMetadataProxy);
        
        console.log("\nImplementation Contracts Owner Check:");
        console.log("Hero Contract Owner:", hero.owner());
        console.log("HeroNFT Contract Owner:", nft.owner());
        console.log("HeroMetadata Contract Owner:", metadata.owner());
        
        // 检查当前实现合约地址
        address heroImpl = admin.getProxyImplementation(TransparentUpgradeableProxy(payable(heroProxy)));
        address nftImpl = admin.getProxyImplementation(TransparentUpgradeableProxy(payable(heroNFTProxy)));
        address metadataImpl = admin.getProxyImplementation(TransparentUpgradeableProxy(payable(heroMetadataProxy)));
        
        console.log("\nCurrent Implementation Addresses:");
        console.log("Hero Implementation:", heroImpl);
        console.log("HeroNFT Implementation:", nftImpl);
        console.log("HeroMetadata Implementation:", metadataImpl);
    }
}
