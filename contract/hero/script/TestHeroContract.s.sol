// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

interface IHero {
    function owner() external view returns (address);
    function nftContract() external view returns (address);
    function setNFTContract(address _nftContract) external;
}

contract TestHeroContractScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address heroNFTProxy = vm.envAddress("VITE_HERO_NFT_PROXY");
        
        IHero hero = IHero(heroProxy);
        
        // 1. 检查当前状态
        console.log("====== Current State ======");
        console.log("Contract owner:", hero.owner());
        console.log("Current NFT contract:", hero.nftContract());
        console.log("Target NFT contract:", heroNFTProxy);
        
        // 2. 设置NFT合约
        console.log("\n====== Setting NFT Contract ======");
        vm.startBroadcast(deployerPrivateKey);
        
        try hero.setNFTContract(heroNFTProxy) {
            console.log("Successfully set NFT contract");
        } catch Error(string memory reason) {
            console.log("Failed to set NFT contract:", reason);
        }
        
        vm.stopBroadcast();
        
        // 3. 验证结果
        console.log("\n====== Final State ======");
        console.log("Updated NFT contract:", hero.nftContract());
    }
}