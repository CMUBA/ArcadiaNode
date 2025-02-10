// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "../src/core/HeroV4.sol";

contract UpgradeHeroNFTScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address proxyAdmin = vm.envAddress("VITE_PROXY_ADMIN");
        address heroNFTProxy = vm.envAddress("VITE_HERO_NFT_PROXY");
        
        // 验证部署者身份
        address deployer = vm.addr(deployerPrivateKey);
        console.log("\nDeployer address:", deployer);
        
        // 验证代理管理员
        ProxyAdmin admin = ProxyAdmin(proxyAdmin);
        address owner = admin.owner();
        require(owner == deployer, "Deployer is not the proxy admin owner");
        console.log("Proxy admin owner verified");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. 部署新的实现合约
        HeroV4 newImplementation = new HeroV4();
        console.log("New HeroV4 implementation deployed to:", address(newImplementation));
        
        // 2. 升级代理合约
        try admin.upgrade(ITransparentUpgradeableProxy(heroNFTProxy), address(newImplementation)) {
            console.log("Proxy upgraded to new implementation");
        } catch Error(string memory reason) {
            console.log("Upgrade failed:", reason);
            vm.stopBroadcast();
            revert("Upgrade failed");
        }
        
        // 3. 初始化新版本
        HeroV4 hero = HeroV4(heroNFTProxy);
        try hero.initialize() {
            console.log("New version initialized");
        } catch Error(string memory reason) {
            // 如果已经初始化过，这是预期的错误
            console.log("Initialize failed (expected if already initialized):", reason);
        }
        
        vm.stopBroadcast();
        console.log("\nUpgrade completed successfully!");
    }
}
