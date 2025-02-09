// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/Hero.sol";
import "../src/proxy/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract CheckProxyScript is Script {
    function run() external view {
        address proxyAdmin = vm.envAddress("VITE_PROXY_ADMIN");
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address heroImpl = vm.envAddress("VITE_HERO_IMPLEMENTATION");
        
        console.log("\nContract Addresses:");
        console.log("ProxyAdmin:", proxyAdmin);
        console.log("Hero Proxy:", heroProxy);
        console.log("Hero Implementation:", heroImpl);
        
        // 检查合约代码大小
        uint256 proxySize;
        uint256 implSize;
        assembly {
            proxySize := extcodesize(heroProxy)
            implSize := extcodesize(heroImpl)
        }
        
        console.log("\nContract Code Sizes:");
        console.log("Proxy size:", proxySize);
        console.log("Implementation size:", implSize);
        
        // 尝试调用合约函数
        Hero hero = Hero(heroProxy);
        try hero.owner() returns (address owner) {
            console.log("\nHero owner:", owner);
        } catch {
            console.log("\nFailed to call owner()");
        }
    }
}
