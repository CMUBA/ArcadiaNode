// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroNFT.sol";
import "../src/proxy/HeroProxy.sol";
import "../src/proxy/ProxyAdmin.sol";

contract DeployHeroNFTScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address paymentToken = vm.envAddress("VITE_PAYMENT_TOKEN_ADDRESS");
        uint256 nativePrice = vm.envUint("VITE_NATIVE_PRICE");
        uint256 tokenPrice = vm.envUint("VITE_ERC20_TOKEN_PRICE");

        vm.startBroadcast(deployerPrivateKey);

        // 部署代理管理合约
        ProxyAdmin proxyAdmin = new ProxyAdmin();

        // 部署实现合约
        HeroNFT heroNFTImpl = new HeroNFT();

        // 准备初始化数据
        bytes memory initData = abi.encodeWithSelector(
            HeroNFT.initialize.selector,
            paymentToken,
            nativePrice,
            tokenPrice
        );

        // 部署代理合约
        HeroProxy heroNFTProxy = new HeroProxy(
            address(heroNFTImpl),
            initData
        );

        // 输出部署的地址
        console.log("ProxyAdmin deployed to:", address(proxyAdmin));
        console.log("HeroNFT Implementation deployed to:", address(heroNFTImpl));
        console.log("HeroNFT Proxy deployed to:", address(heroNFTProxy));

        vm.stopBroadcast();
    }
} 