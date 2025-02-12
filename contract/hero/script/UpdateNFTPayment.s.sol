// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroNFT.sol";

contract UpdateNFTPaymentScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("\n=== Pre-update Checks ===");
        console.log("Deployer address:", deployer);
        
        // Update HeroNFT payment settings
        HeroNFT heroNFT = HeroNFT(0x776f3f1137bc5f7363EE2c25116546661d2B8131);
        
        // 先检查合约所有者
        address currentOwner = heroNFT.owner();
        console.log("Contract owner:", currentOwner);
        console.log("Deployer address:", deployer);
        require(currentOwner == deployer, "Not contract owner");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Set ERC20 token as payment token
        address newToken = 0xBda48255DA1ed61a209641144Dd24696926aF3F0;
        heroNFT.setDefaultPaymentToken(newToken);
        
        // Update prices if needed
        uint256 nativePrice = 0.01 ether;
        uint256 tokenPrice = 100 ether;
        heroNFT.setDefaultPrices(nativePrice, tokenPrice);

        vm.stopBroadcast();
        
        console.log("\n=== NFT Payment Update Information ===");
        console.log("HeroNFT Address: %s", address(heroNFT));
        console.log("New Payment Token: %s", newToken);
        console.log("Native Price: %s ETH", nativePrice / 1 ether);
        console.log("Token Price: %s Tokens", tokenPrice / 1 ether);
    }
}