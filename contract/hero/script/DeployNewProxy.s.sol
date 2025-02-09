// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroV2.sol";
import "../src/proxy/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract DeployNewProxyScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address proxyAdmin = vm.envAddress("VITE_PROXY_ADMIN");
        
        // 验证部署者身份
        address deployer = vm.addr(deployerPrivateKey);
        console.log("\nDeployer address:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);

        // 1. 部署新的实现合约
        HeroV2 implementation = new HeroV2();
        console.log("New Hero implementation deployed to:", address(implementation));

        // 2. 准备初始化数据
        bytes memory initData = abi.encodeWithSelector(HeroV2.initialize.selector);
        
        // 3. 部署新的代理合约
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
            address(implementation),
            proxyAdmin,
            initData
        );
        console.log("New Hero proxy deployed to:", address(proxy));

        // 4. 检查版本
        HeroV2 hero = HeroV2(address(proxy));
        string memory version = hero.VERSION();
        console.log("\nContract version:", version);
        
        vm.stopBroadcast();
        
        // 输出新地址用于更新 .env
        console.log("\nUpdate your .env file with:");
        console.log("VITE_HERO_IMPLEMENTATION=%s", address(implementation));
        console.log("VITE_HERO_PROXY=%s", address(proxy));
    }
}
