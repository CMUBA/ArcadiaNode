// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroNFT.sol";

contract UpdateNFTPaymentScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address deployer = vm.addr(deployerPrivateKey);
        
        // 检查网络
        uint256 chainId = block.chainid;
        console.log("\n=== Network Information ===");
        console.log("Chain ID:", chainId);
        require(chainId == 11155420, "Wrong network - must be Optimism Sepolia");
        
        console.log("\n=== Pre-update Checks ===");
        console.log("Deployer address:", deployer);
        
        // 从最新部署获取地址
        address nftAddress = 0x776f3f1137bc5f7363EE2c25116546661d2B8131;
        console.log("NFT contract address:", nftAddress);
        
        // 检查RPC连接
        console.log("Current block:", block.number);
        console.log("Current timestamp:", block.timestamp);
        
        // 检查合约是否存在
        uint256 size;
        assembly {
            size := extcodesize(nftAddress)
        }
        console.log("Contract code size:", size);
        require(size > 0, "Contract does not exist at the specified address");
        
        // 检查环境变量
        string memory rpcUrl = vm.envString("RPC_URL");
        console.log("Using RPC URL:", rpcUrl);
        
        HeroNFT heroNFT = HeroNFT(nftAddress);
        
        try heroNFT.owner() returns (address currentOwner) {
            console.log("Contract owner:", currentOwner);
            console.log("Deployer address:", deployer);
            require(currentOwner == deployer, "Not contract owner");
        } catch Error(string memory reason) {
            console.log("Failed to get owner:", reason);
            revert("Failed to get contract owner");
        } catch {
            console.log("Failed to get owner (unknown reason)");
            revert("Failed to get contract owner - unknown error");
        }
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Set ERC20 token as payment token
        address newToken = 0xBda48255DA1ed61a209641144Dd24696926aF3F0;
        try heroNFT.setDefaultPaymentToken(newToken) {
            console.log("Successfully set default payment token");
        } catch Error(string memory reason) {
            console.log("Failed to set payment token:", reason);
            revert("Failed to set payment token");
        }
        
        // Update prices if needed
        uint256 nativePrice = 0.01 ether;
        uint256 tokenPrice = 100 ether;
        try heroNFT.setDefaultPrices(nativePrice, tokenPrice) {
            console.log("Successfully set default prices");
        } catch Error(string memory reason) {
            console.log("Failed to set prices:", reason);
            revert("Failed to set prices");
        }

        vm.stopBroadcast();
        
        console.log("\n=== NFT Payment Update Information ===");
        console.log("HeroNFT Address: %s", nftAddress);
        console.log("New Payment Token: %s", newToken);
        console.log("Native Price: %s ETH", nativePrice / 1 ether);
        console.log("Token Price: %s Tokens", tokenPrice / 1 ether);
    }
}