// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroNFT.sol";

contract InitMintNFTScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address heroNFTProxy = vm.envAddress("VITE_HERO_NFT_PROXY");
        
        HeroNFT nft = HeroNFT(heroNFTProxy);
        uint256 mintPrice = 0.01 ether;
        address defaultSender = vm.addr(1);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Mint 5 NFTs
        for (uint256 i = 1; i <= 5; i++) {
            try nft.mint{value: mintPrice}(defaultSender, i) {
                console.log("Successfully minted NFT #", i);
            } catch Error(string memory reason) {
                console.log("Failed to mint NFT #", i);
                console.log("Reason:", reason);
            } catch (bytes memory) {
                console.log("Failed to mint NFT #", i);
                console.log("Unknown error occurred");
            }
        }
        
        vm.stopBroadcast();
    }
}