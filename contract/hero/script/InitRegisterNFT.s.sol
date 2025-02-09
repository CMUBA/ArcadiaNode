// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/Hero.sol";

interface IHero {
    function setNFTContract(address _nftContract) external;
    function addRegisteredNFT(address nftContract) external;
}

contract InitRegisterNFTScript is Script {
    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address heroProxy = vm.envAddress("VITE_HERO_PROXY");
        address heroNFTProxy = vm.envAddress("VITE_HERO_NFT_PROXY");

        vm.startBroadcast(deployerPrivateKey);

        // 设置主NFT合约并注册
        IHero hero = IHero(heroProxy);
        hero.setNFTContract(heroNFTProxy);
        hero.addRegisteredNFT(heroNFTProxy);

        console.log("Registered NFT contract:", heroNFTProxy);
        console.log("to Hero contract:", heroProxy);

        vm.stopBroadcast();
    }
}
