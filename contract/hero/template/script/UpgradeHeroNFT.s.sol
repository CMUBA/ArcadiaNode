// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "../src/core/HeroNFT.sol";

contract UpgradeHeroNFTScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("HERO_PRIVATE_KEY");
        address proxyAdmin = vm.envAddress("VITE_PROXY_ADMIN");
        address heroNFTProxy = vm.envAddress("VITE_HERO_NFT_PROXY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. 部署新的实现合约
        HeroNFT newImplementation = new HeroNFT();
        console.log("New implementation deployed at:", address(newImplementation));
        
        // 2. 升级代理
        ProxyAdmin admin = ProxyAdmin(proxyAdmin);
        try admin.upgrade(TransparentUpgradeableProxy(payable(heroNFTProxy)), address(newImplementation)) {
            console.log("Proxy upgraded successfully");
            
            // 3. 验证升级
            address currentImpl = admin.getProxyImplementation(TransparentUpgradeableProxy(payable(heroNFTProxy)));
            require(currentImpl == address(newImplementation), "Upgrade verification failed");
            console.log("Upgrade verified successfully");
        } catch Error(string memory reason) {
            console.log("Failed to upgrade proxy:", reason);
            vm.stopBroadcast();
            return;
        }
        
        vm.stopBroadcast();
    }
}
