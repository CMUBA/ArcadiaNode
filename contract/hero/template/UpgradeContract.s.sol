// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "../../src/proxy/ProxyAdmin.sol";

// 注意：使用此模板时，需要：
// 1. 替换 ContractV2 为实际的合约
// 2. 修改环境变量名称
// 3. 根据需要修改初始化参数

contract UpgradeContractScript is Script {
    function run() external {
        // 1. 加载环境变量
        bytes32 privateKeyHash = vm.envBytes32("PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address proxyAdmin = vm.envAddress("PROXY_ADMIN");
        address proxy = vm.envAddress("PROXY_ADDRESS");
        
        address deployer = vm.addr(deployerPrivateKey);
        console.log("\nDeployer address:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);

        // 2. 部署新的实现合约
        ContractV2 implementation = new ContractV2();
        console.log("New implementation deployed to:", address(implementation));

        // 3. 准备初始化数据
        bytes memory initData = abi.encodeWithSelector(
            ContractV2.initialize.selector
            // 在这里添加初始化参数
        );
        
        // 4. 升级并初始化
        ProxyAdmin admin = ProxyAdmin(proxyAdmin);
        admin.upgradeAndCall(
            ITransparentUpgradeableProxy(proxy),
            address(implementation),
            initData
        );
        console.log("Contract upgraded and initialized");

        // 5. 验证升级
        ContractV2 contractInstance = ContractV2(proxy);
        string memory version = contractInstance.VERSION();
        console.log("\nNew contract version:", version);
        
        vm.stopBroadcast();
        
        // 输出新地址用于更新 .env
        console.log("\nUpdate your .env file with:");
        console.log("CONTRACT_IMPLEMENTATION=%s", address(implementation));
    }
}
