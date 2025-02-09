// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroNFT.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract InitMintNFTScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address heroNFTProxy = vm.envAddress("VITE_HERO_NFT_PROXY");
        
        HeroNFT nft = HeroNFT(heroNFTProxy);
        address defaultSender = vm.addr(1);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 1. 使用 ETH 铸造 NFT
        uint256 nativePrice = 0.01 ether;
        try nft.mint{value: nativePrice}(defaultSender, 1) {
            console.log("Successfully minted NFT #1 with ETH");
        } catch Error(string memory reason) {
            console.log("Failed to mint NFT #1 with ETH");
            console.log("Reason:", reason);
        }

        // 2. 使用 ERC20 代币铸造 NFT
        address paymentToken = address(nft.defaultPaymentToken());
        uint256 tokenPrice = nft.defaultTokenPrice();
        
        // 如果使用 ERC20，需要先批准代币使用
        if (paymentToken != address(0)) {
            IERC20 token = IERC20(paymentToken);
            
            try token.approve(address(nft), tokenPrice) {
                console.log("Approved ERC20 token for NFT minting");
                
                try nft.mintWithToken(defaultSender, 2, paymentToken) {
                    console.log("Successfully minted NFT #2 with ERC20");
                } catch Error(string memory reason) {
                    console.log("Failed to mint NFT #2 with ERC20");
                    console.log("Reason:", reason);
                }
            } catch Error(string memory reason) {
                console.log("Failed to approve ERC20 token");
                console.log("Reason:", reason);
            }
        } else {
            console.log("No ERC20 payment token configured");
        }

        vm.stopBroadcast();
        
        // 输出铸造结果
        console.log("\nFinal state:");
        console.log("Default native price:", nativePrice);
        console.log("Default token price:", tokenPrice);
        console.log("Payment token:", paymentToken);
    }
}