// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/Hero.sol";
import "../src/core/HeroNFT.sol";

contract InitRegisterNFTScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address heroNFTProxy = vm.envAddress("VITE_HERO_NFT_PROXY");
        
        vm.startBroadcast(deployerPrivateKey);

        // 获取 Hero 合约实例（通过代理）
        Hero hero = Hero(heroProxy);
        
        // 注册 NFT 合约为官方 NFT
        try hero.registerNFT(heroNFTProxy, true) {
            console.log("Successfully registered NFT contract as official NFT");
            console.log("NFT contract address:", heroNFTProxy);
        } catch Error(string memory reason) {
            console.log("Failed to register NFT contract");
            console.log("Reason:", reason);
        }

        // 验证注册状态
        bool isRegistered = hero.isNFTRegistered(heroNFTProxy);
        console.log("NFT registration status:", isRegistered);
        
        // 获取注册的 NFT 数量
        uint256 count = hero.getRegisteredNFTCount();
        console.log("Total registered NFTs:", count);

        vm.stopBroadcast();
    }
}
