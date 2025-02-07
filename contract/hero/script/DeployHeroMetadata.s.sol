// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroMetadata.sol";
import "../src/proxy/HeroProxy.sol";
import "../src/proxy/ProxyAdmin.sol";

contract DeployHeroMetadataScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);

        vm.startBroadcast(deployerPrivateKey);

        // 部署代理管理合约
        ProxyAdmin proxyAdmin = new ProxyAdmin();

        // 部署实现合约
        HeroMetadata heroMetadataImpl = new HeroMetadata();

        // 部署代理合约
        bytes memory heroMetadataData = abi.encodeWithSelector(
            HeroMetadata.initialize.selector
        );
        HeroProxy heroMetadataProxy = new HeroProxy(
            address(heroMetadataImpl),
            heroMetadataData
        );

        // 输出部署的地址
        console.log("ProxyAdmin deployed to:", address(proxyAdmin));
        console.log("HeroMetadata Implementation deployed to:", address(heroMetadataImpl));
        console.log("HeroMetadata Proxy deployed to:", address(heroMetadataProxy));

        vm.stopBroadcast();
    }
} 