// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

// 注意：使用此模板时，需要：
// 1. 替换 ContractV2 为实际的合约
// 2. 修改环境变量名称
// 3. 根据需要修改初始化参数

contract DeployNewProxyScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address proxyAdmin = vm.envAddress("PROXY_ADMIN");
        
        address deployer = vm.addr(deployerPrivateKey);
        console.log("\nDeployer address:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);

        // 1. 部署新的实现合约
        ContractV2 implementation = new ContractV2();
        console.log("New implementation deployed to:", address(implementation));

        // 2. 准备初始化数据
        bytes memory initData = abi.encodeWithSelector(
            ContractV2.initialize.selector
            // 在这里添加初始化参数
        );
        
        // 3. 部署新的代理合约
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
            address(implementation),
            proxyAdmin,
            initData
        );
        console.log("New proxy deployed to:", address(proxy));

        // 4. 检查版本
        ContractV2 contractInstance = ContractV2(address(proxy));
        string memory version = contractInstance.VERSION();
        console.log("\nContract version:", version);
        
        vm.stopBroadcast();
        
        // 输出新地址用于更新 .env
        console.log("\nUpdate your .env file with:");
        console.log("CONTRACT_IMPLEMENTATION=%s", address(implementation));
        console.log("CONTRACT_PROXY=%s", address(proxy));
    }
}
