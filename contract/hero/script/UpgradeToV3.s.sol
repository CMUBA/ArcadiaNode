// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "../src/core/HeroV3.sol";

contract UpgradeToV3Script is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address proxyAdmin = vm.envAddress("VITE_PROXY_ADMIN");
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        
        // 验证部署者身份
        address deployer = vm.addr(deployerPrivateKey);
        console.log("\nDeployer address:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. 部署新的实现合约
        HeroV3 newImplementation = new HeroV3();
        console.log("\nNew implementation deployed at:", address(newImplementation));
        
        // 2. 升级代理合约
        ProxyAdmin admin = ProxyAdmin(proxyAdmin);
        admin.upgrade(ITransparentUpgradeableProxy(heroProxy), address(newImplementation));
        console.log("Proxy upgraded to new implementation");
        
        // 3. 初始化新版本
        HeroV3 hero = HeroV3(heroProxy);
        hero.initialize();
        console.log("New version initialized");
        
        // 4. 验证升级
        string memory version = hero.VERSION();
        console.log("\nNew version:", version);
        
        vm.stopBroadcast();
        
        // 5. 输出环境变量更新建议
        console.log("\nPlease update your .env file with:");
        console.log("VITE_HERO_IMPLEMENTATION=", address(newImplementation));
    }
}
