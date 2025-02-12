// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroNFT.sol";

contract UpdateNFTPaymentScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        
        vm.startBroadcast(deployerPrivateKey);

        // Update HeroNFT payment settings
        HeroNFT heroNFT = HeroNFT(0x776f3f1137bc5f7363EE2c25116546661d2B8131);
        
        // 先检查合约所有者
        require(heroNFT.owner() == vm.addr(deployerPrivateKey), "Not contract owner");
        
        // Set ERC20 token as payment token
        heroNFT.setDefaultPaymentToken(0xBda48255DA1ed61a209641144Dd24696926aF3F0);
        
        // Update prices if needed
        heroNFT.setDefaultPrices(
            0.01 ether,  // native price
            100 ether    // token price
        );

        vm.stopBroadcast();
        
        console.log("\n=== NFT Payment Update Information ===");
        console.log("HeroNFT Address: %s", address(heroNFT));
        console.log("New Payment Token: 0xBda48255DA1ed61a209641144Dd24696926aF3F0");
        console.log("Native Price: 0.01 ETH");
        console.log("Token Price: 100 Tokens");
    }
}