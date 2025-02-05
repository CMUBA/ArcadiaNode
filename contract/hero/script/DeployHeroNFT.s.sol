// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroNFT.sol";
import "../src/proxy/HeroProxy.sol";
import "../src/proxy/ProxyAdmin.sol";

contract DeployHeroNFTScript is Script {
    function run() external {
        string memory optimismEnv = vm.readFile("optimism/.env");
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);

        vm.startBroadcast(deployerPrivateKey);

        // 部署代理管理合约
        ProxyAdmin proxyAdmin = new ProxyAdmin();

        // 部署实现合约
        HeroNFT heroNFTImpl = new HeroNFT();

        // 部署代理合约
        bytes memory heroNFTData = abi.encodeWithSelector(HeroNFT.initialize.selector);
        HeroProxy heroNFTProxy = new HeroProxy(
            address(heroNFTImpl),
            heroNFTData
        );

        // 输出部署的地址
        console.log("ProxyAdmin deployed to:", address(proxyAdmin));
        console.log("HeroNFT Implementation deployed to:", address(heroNFTImpl));
        console.log("HeroNFT Proxy deployed to:", address(heroNFTProxy));

        vm.stopBroadcast();
    }
} 