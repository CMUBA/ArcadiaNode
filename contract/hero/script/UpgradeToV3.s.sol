// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "../src/core/HeroV3.sol";

contract UpgradeToV3Script is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("HERO_PRIVATE_KEY");
        address proxyAdmin = vm.envAddress("VITE_PROXY_ADMIN");
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. 部署新的实现合约
        HeroV3 newImplementation = new HeroV3();
        console.log("New implementation deployed at:", address(newImplementation));
        
        // 2. 升级代理
        ProxyAdmin admin = ProxyAdmin(proxyAdmin);
        admin.upgrade(TransparentUpgradeableProxy(payable(heroProxy)), address(newImplementation));
        console.log("Proxy upgraded");
        
        // 3. 初始化 V3
        HeroV3(heroProxy).initialize();
        console.log("HeroV3 initialized");
        
        vm.stopBroadcast();
    }
}
