// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroV2.sol";
import "../src/proxy/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract UpgradeHeroScript is Script {
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
        HeroV2 newImplementation = new HeroV2();
        console.log("New Hero implementation deployed to:", address(newImplementation));

        // 2. 验证 ProxyAdmin 所有权
        ProxyAdmin admin = ProxyAdmin(proxyAdmin);
        address adminOwner = admin.owner();
        console.log("\nProxyAdmin owner:", adminOwner);
        require(adminOwner == deployer, "Deployer is not ProxyAdmin owner");
        
        // 3. 保存当前状态
        HeroV2 currentHero = HeroV2(heroProxy);
        address currentOfficialNFT = currentHero.officialNFT();
        console.log("\nCurrent state:");
        console.log("Official NFT:", currentOfficialNFT);
        
        // 4. 升级合约
        console.log("\nUpgrading to new implementation...");
        admin.upgrade(ITransparentUpgradeableProxy(heroProxy), address(newImplementation));
        console.log("Hero proxy upgraded to new implementation");

        // 5. 初始化新合约
        console.log("\nInitializing new implementation...");
        HeroV2 hero = HeroV2(heroProxy);
        hero.initialize();
        console.log("New implementation initialized");

        // 6. 检查版本
        string memory version = hero.VERSION();
        console.log("\nNew contract version:", version);
        
        // 7. 验证状态是否保持
        address newOfficialNFT = hero.officialNFT();
        console.log("\nVerifying state:");
        console.log("Official NFT:", newOfficialNFT);
        require(newOfficialNFT == currentOfficialNFT, "State verification failed");
        console.log("State verified successfully");
        
        vm.stopBroadcast();
        
        // 输出新地址用于更新 .env
        console.log("\nUpdate your .env file with:");
        console.log("VITE_HERO_IMPLEMENTATION=%s", address(newImplementation));
    }
}
