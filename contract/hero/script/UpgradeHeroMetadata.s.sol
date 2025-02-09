// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroMetadata.sol";
import "../src/proxy/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract UpgradeHeroMetadataScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address proxyAdmin = vm.envAddress("VITE_PROXY_ADMIN");
        address heroMetadataProxy = vm.envAddress("VITE_HERO_METADATA_PROXY");
        
        vm.startBroadcast(deployerPrivateKey);

        // 1. 部署新的实现合约
        HeroMetadata newImplementation = new HeroMetadata();
        console.log("New HeroMetadata implementation deployed to:", address(newImplementation));

        // 2. 升级代理合约指向新的实现
        ProxyAdmin admin = ProxyAdmin(proxyAdmin);
        admin.upgrade(ITransparentUpgradeableProxy(heroMetadataProxy), address(newImplementation));
        console.log("HeroMetadata proxy upgraded to new implementation");

        // 3. 验证升级
        address currentImpl = admin.getProxyImplementation(ITransparentUpgradeableProxy(heroMetadataProxy));
        require(currentImpl == address(newImplementation), "Upgrade verification failed");
        
        vm.stopBroadcast();
        
        // 输出新地址用于更新 .env
        console.log("\nUpdate your .env file with:");
        console.log("VITE_HERO_METADATA_IMPLEMENTATION=%s", address(newImplementation));
    }
}
