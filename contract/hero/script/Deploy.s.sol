// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/Hero.sol";
import "../src/core/HeroNFT.sol";
import "../src/core/HeroMetadata.sol";
import "../src/proxy/HeroProxy.sol";
import "../src/proxy/ProxyAdmin.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        // 部署代理管理合约
        ProxyAdmin proxyAdmin = new ProxyAdmin();

        // 部署实现合约
        HeroNFT heroNFTImpl = new HeroNFT();
        Hero heroImpl = new Hero();
        HeroMetadata heroMetadataImpl = new HeroMetadata();

        // 部署代理合约
        bytes memory heroNFTData = abi.encodeWithSelector(HeroNFT.initialize.selector);
        HeroProxy heroNFTProxy = new HeroProxy(
            address(heroNFTImpl),
            heroNFTData
        );

        bytes memory heroData = abi.encodeWithSelector(
            Hero.initialize.selector,
            address(heroNFTProxy)
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
        console.log("ProxyAdmin deployed to:", address(proxyAdmin));
        console.log("HeroNFT Proxy deployed to:", address(heroNFTProxy));
        console.log("Hero Proxy deployed to:", address(heroProxy));
        console.log("HeroMetadata Proxy deployed to:", address(heroMetadataProxy));

        vm.stopBroadcast();
    }
} 