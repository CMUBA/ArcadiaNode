// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ITransparentUpgradeableProxy.sol";
import "../src/core/Hero.sol";

contract CheckPermissionsScript is Script {
    function run() external view {
        address proxyAdmin = vm.envAddress("VITE_PROXY_ADMIN");
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address deployer = vm.addr(uint256(vm.envBytes32("HERO_PRIVATE_KEY")));
        
        console.log("\nAddresses:");
        console.log("ProxyAdmin:", proxyAdmin);
        console.log("Hero Proxy:", heroProxy);
        console.log("Deployer:", deployer);
        
        // 检查合约状态
        Hero hero = Hero(heroProxy);
        
        // 1. 检查版本
        try hero.VERSION() returns (string memory version) {
            console.log("\nContract version:", version);
        } catch {
            console.log("\nFailed to get version");
        }
        
        // 2. 检查代理合约的管理员
        ProxyAdmin admin = ProxyAdmin(proxyAdmin);
        try admin.getProxyAdmin(ITransparentUpgradeableProxy(heroProxy)) returns (address proxyAdminAddr) {
            console.log("\nProxy admin address:", proxyAdminAddr);
            console.log("Is ProxyAdmin the admin?", proxyAdminAddr == proxyAdmin);
        } catch {
            console.log("\nFailed to get proxy admin");
        }
        
        // 3. 检查代理合约的实现
        try admin.getProxyImplementation(ITransparentUpgradeableProxy(heroProxy)) returns (address implementation) {
            console.log("\nProxy implementation:", implementation);
        } catch {
            console.log("\nFailed to get proxy implementation");
        }
    }
}
