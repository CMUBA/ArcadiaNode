// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "../src/core/HeroMetadata.sol";

contract UpgradeHeroMetadataScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("HERO_PRIVATE_KEY");
        address proxyAdmin = vm.envAddress("VITE_PROXY_ADMIN");
        address heroMetadataProxy = vm.envAddress("VITE_HERO_METADATA_PROXY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. 部署新的实现合约
        HeroMetadata newImplementation = new HeroMetadata();
        console.log("New implementation deployed at:", address(newImplementation));
        
        // 2. 升级代理
        ProxyAdmin admin = ProxyAdmin(proxyAdmin);
        admin.upgrade(TransparentUpgradeableProxy(payable(heroMetadataProxy)), address(newImplementation));
        console.log("Proxy upgraded");
        
        // 3. 验证升级
        address currentImpl = admin.getProxyImplementation(TransparentUpgradeableProxy(payable(heroMetadataProxy)));
        require(currentImpl == address(newImplementation), "Upgrade verification failed");
        console.log("Upgrade verified successfully");
        
        vm.stopBroadcast();
    }
}
