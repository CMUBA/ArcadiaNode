// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroV2.sol";

contract RegisterOldNFTScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address oldOfficialNFT = 0xb4AE3C6B8531D97EA6146c2e7B811B8D82f9019c;
        
        // 验证部署者身份
        address deployer = vm.addr(deployerPrivateKey);
        console.log("\nDeployer address:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);

        // 注册旧的 NFT
        HeroV2 hero = HeroV2(heroProxy);
        hero.registerNFT(oldOfficialNFT, true);
        console.log("Registered old NFT:", oldOfficialNFT);

        // 验证注册
        address officialNFT = hero.officialNFT();
        console.log("\nOfficial NFT:", officialNFT);
        
        address[] memory nfts = hero.getRegisteredNFTs();
        console.log("\nRegistered NFTs:");
        for (uint i = 0; i < nfts.length; i++) {
            console.log(nfts[i]);
        }
        
        vm.stopBroadcast();
    }
}
