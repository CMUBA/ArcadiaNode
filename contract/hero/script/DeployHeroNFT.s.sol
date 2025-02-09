// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";
import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";
import "../src/core/HeroNFT.sol";

contract DeployHeroNFTScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address paymentToken = vm.envAddress("VITE_PAYMENT_TOKEN_ADDRESS");
        uint256 nativePrice = vm.envUint("VITE_NATIVE_PRICE");
        uint256 tokenPrice = vm.envUint("VITE_ERC20_TOKEN_PRICE");

        // 验证部署者身份
        address deployer = vm.addr(deployerPrivateKey);
        console.log("\nDeployer address:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. 部署代理管理合约
        ProxyAdmin proxyAdmin = new ProxyAdmin();
        console.log("\nProxy Admin deployed at:", address(proxyAdmin));

        // 2. 部署实现合约
        HeroNFT heroNFTImpl = new HeroNFT();
        console.log("HeroNFT Implementation deployed at:", address(heroNFTImpl));

        // 3. 准备初始化数据
        bytes memory initData = abi.encodeWithSelector(
            HeroNFT.initialize.selector,
            paymentToken,
            nativePrice,
            tokenPrice
        );

        // 4. 部署代理合约
        TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(
            address(heroNFTImpl),
            address(proxyAdmin),
            initData
        );
        console.log("HeroNFT Proxy deployed at:", address(proxy));

        // 5. 验证部署
        HeroNFT nft = HeroNFT(address(proxy));
        console.log("\nVerification:");
        console.log("Version:", nft.VERSION());
        console.log("Default Payment Token:", nft.getDefaultPaymentToken());
        console.log("Default Native Price:", nft.getDefaultNativePrice());
        console.log("Default Token Price:", nft.getDefaultTokenPrice());

        vm.stopBroadcast();

        // 6. 输出环境变量更新建议
        console.log("\nPlease update your .env file with:");
        console.log("VITE_HERO_NFT_IMPLEMENTATION=", address(heroNFTImpl));
        console.log("VITE_HERO_NFT_PROXY=", address(proxy));
        console.log("VITE_HERO_NFT_PROXY_ADMIN=", address(proxyAdmin));
    }
}