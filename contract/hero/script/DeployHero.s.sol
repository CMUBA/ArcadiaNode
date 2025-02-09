// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/Hero.sol";
import "../src/proxy/HeroProxy.sol";
import "../src/proxy/ProxyAdmin.sol";

contract DeployHeroScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);

        // 从环境变量获取已部署的 NFT 合约地址
        address heroNFTAddress = vm.envAddress("VITE_HERO_NFT_PROXY");

        vm.startBroadcast(deployerPrivateKey);

        // 部署代理管理合约
        ProxyAdmin proxyAdmin = new ProxyAdmin();

        // 部署实现合约
        Hero heroImpl = new Hero();

        // 部署代理合约
        bytes memory heroData = abi.encodeWithSelector(
            Hero.initialize.selector
        );
        HeroProxy heroProxy = new HeroProxy(
            address(heroImpl),
            heroData
        );

        // 输出部署的地址
        console.log("ProxyAdmin deployed to:", address(proxyAdmin));
        console.log("Hero Implementation deployed to:", address(heroImpl));
        console.log("Hero Proxy deployed to:", address(heroProxy));

        vm.stopBroadcast();
    }
} 