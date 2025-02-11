// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

// 注意：使用此模板时，需要：
// 1. 导入实际的合约
// 2. 修改环境变量名称
// 3. 添加需要检查的状态变量

interface IVersionedContract {
    function VERSION() external view returns (string memory);
    function owner() external view returns (address);
}

contract CheckStateScript is Script {
    function run() external view {
        address proxyAdmin = vm.envAddress("PROXY_ADMIN");
        address proxy = vm.envAddress("PROXY_ADDRESS");
        address implementation = vm.envAddress("IMPLEMENTATION_ADDRESS");
        address deployer = vm.addr(uint256(vm.envBytes32("PRIVATE_KEY")));
        
        console.log("\nAddresses:");
        console.log("ProxyAdmin:", proxyAdmin);
        console.log("Proxy:", proxy);
        console.log("Implementation:", implementation);
        console.log("Deployer:", deployer);
        
        // 检查合约状态
        IVersionedContract versionedContract = IVersionedContract(proxy);
        
        // 1. 检查版本
        try versionedContract.VERSION() returns (string memory version) {
            console.log("\nContract version:", version);
        } catch {
            console.log("\nFailed to get version");
        }
        
        // 2. 检查所有者
        try versionedContract.owner() returns (address owner) {
            console.log("\nContract owner:", owner);
            console.log("Is deployer the owner?", owner == deployer);
        } catch {
            console.log("\nFailed to get owner");
        }
        
        // 3. 检查代理合约的管理员
        ProxyAdmin admin = ProxyAdmin(proxyAdmin);
        try admin.getProxyAdmin(TransparentUpgradeableProxy(payable(proxy))) returns (address proxyAdminAddr) {
            console.log("\nProxy admin address:", proxyAdminAddr);
            console.log("Is ProxyAdmin the admin?", proxyAdminAddr == proxyAdmin);
        } catch {
            console.log("\nFailed to get proxy admin");
        }
        
        // 4. 检查代理合约的实现
        try admin.getProxyImplementation(TransparentUpgradeableProxy(payable(proxy))) returns (address currentImpl) {
            console.log("\nProxy implementation:", currentImpl);
            console.log("Implementation matches env?", currentImpl == implementation);
        } catch {
            console.log("\nFailed to get proxy implementation");
        }
        
        // 5. 在这里添加其他状态检查
        // ...
    }
}
