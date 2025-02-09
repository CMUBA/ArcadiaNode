// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroNFT.sol";
import "../src/proxy/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract UpgradeHeroNFTScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address proxyAdmin = vm.envAddress("VITE_PROXY_ADMIN");
        address heroNFTProxy = vm.envAddress("VITE_HERO_NFT_PROXY");
        
        vm.startBroadcast(deployerPrivateKey);

        // 1. 部署新的实现合约
        HeroNFT newImplementation = new HeroNFT();
        console.log("New HeroNFT implementation deployed to:", address(newImplementation));

        // 2. 升级代理合约指向新的实现
        ProxyAdmin admin = ProxyAdmin(proxyAdmin);
        admin.upgrade(ITransparentUpgradeableProxy(heroNFTProxy), address(newImplementation));
        console.log("HeroNFT proxy upgraded to new implementation");

        // 3. 验证升级
        address currentImpl = admin.getProxyImplementation(ITransparentUpgradeableProxy(heroNFTProxy));
        require(currentImpl == address(newImplementation), "Upgrade verification failed");
        
        vm.stopBroadcast();
        
        // 输出新地址用于更新 .env
        console.log("\nUpdate your .env file with:");
        console.log("VITE_HERO_NFT_IMPLEMENTATION=%s", address(newImplementation));
    }
}
