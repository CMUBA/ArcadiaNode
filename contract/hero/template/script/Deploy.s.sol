// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "../src/core/Hero.sol";
import "../src/core/HeroNFT.sol";
import "../src/core/HeroMetadata.sol";
import "../src/proxy/HeroProxy.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("HERO_PRIVATE_KEY");
        address proxyAdmin = vm.envAddress("VITE_PROXY_ADMIN");
        
        vm.startBroadcast(deployerPrivateKey);

        // 1. 部署新的实现合约
        HeroNFT heroNFTImpl = new HeroNFT(
            address(0),  // defaultToken
            0.1 ether,  // nativePrice
            100 ether   // tokenPrice
        );
        console.log("New implementation deployed at:", address(heroNFTImpl));
        
        // 2. 部署新的代理合约
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
            address(heroNFTImpl),
            proxyAdmin,
            ""  // 空的初始化数据
        );
        console.log("New proxy deployed to:", address(proxy));
        
        // 部署实现合约
        Hero heroImpl = new Hero();
        HeroMetadata heroMetadataImpl = new HeroMetadata();

        // 部署代理合约
        bytes memory heroData = abi.encodeWithSelector(
            Hero.initialize.selector,
            address(proxy)
        );
        HeroProxy heroProxy = new HeroProxy(
            address(heroImpl),
            heroData
        );

        bytes memory heroMetadataData = abi.encodeWithSelector(
            HeroMetadata.initialize.selector
        );
        HeroProxy heroMetadataProxy = new HeroProxy(
            address(heroMetadataImpl),
            heroMetadataData
        );

        // 输出部署的地址
        console.log("Hero Proxy deployed to:", address(heroProxy));
        console.log("HeroMetadata Proxy deployed to:", address(heroMetadataProxy));

        vm.stopBroadcast();
    }
} 