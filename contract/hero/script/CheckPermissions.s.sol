// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/Hero.sol";
import "../src/proxy/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

contract CheckPermissionsScript is Script {
    function run() external view {
        address proxyAdmin = vm.envAddress("VITE_PROXY_ADMIN");
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address heroImpl = vm.envAddress("VITE_HERO_IMPLEMENTATION");
        address deployer = vm.addr(uint256(vm.envBytes32("HERO_PRIVATE_KEY")));
        
        console.log("\nAddresses:");
        console.log("ProxyAdmin:", proxyAdmin);
        console.log("Hero Proxy:", heroProxy);
        console.log("Hero Implementation:", heroImpl);
        console.log("Deployer:", deployer);
        
        // 检查 ProxyAdmin 的所有者
        ProxyAdmin admin = ProxyAdmin(proxyAdmin);
        try admin.owner() returns (address owner) {
            console.log("\nProxyAdmin owner:", owner);
            console.log("Is deployer the owner?", owner == deployer);
        } catch {
            console.log("\nFailed to get ProxyAdmin owner");
        }
        
        // 检查代理合约的管理员
        try admin.getProxyAdmin(ITransparentUpgradeableProxy(heroProxy)) returns (address proxyAdminAddr) {
            console.log("\nProxy admin address:", proxyAdminAddr);
            console.log("Is ProxyAdmin the admin?", proxyAdminAddr == proxyAdmin);
        } catch {
            console.log("\nFailed to get proxy admin");
        }
        
        // 检查代理合约的实现
        try admin.getProxyImplementation(ITransparentUpgradeableProxy(heroProxy)) returns (address implementation) {
            console.log("\nProxy implementation:", implementation);
            console.log("Implementation matches env?", implementation == heroImpl);
        } catch {
            console.log("\nFailed to get proxy implementation");
        }
    }
}
