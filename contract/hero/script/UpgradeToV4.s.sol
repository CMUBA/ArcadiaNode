// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts-upgradeable/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts-upgradeable/proxy/transparent/TransparentUpgradeableProxy.sol";
import "../src/core/HeroV4.sol";

contract UpgradeToV4Script is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("HERO_PRIVATE_KEY");
        address proxyAddress = vm.envAddress("VITE_HERO_PROXY");
        address proxyAdminAddress = vm.envAddress("VITE_PROXY_ADMIN");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. 部署新的实现合约
        HeroV4 heroV4 = new HeroV4();
        console.log("HeroV4 implementation deployed at:", address(heroV4));
        
        // 2. 升级代理
        ProxyAdmin proxyAdmin = ProxyAdmin(proxyAdminAddress);
        proxyAdmin.upgrade(
            TransparentUpgradeableProxy(payable(proxyAddress)),
            address(heroV4)
        );
        console.log("Proxy upgraded to V4");
        
        // 3. 初始化 V4
        HeroV4(proxyAddress).initialize();
        console.log("HeroV4 initialized");
        
        vm.stopBroadcast();
    }
}
