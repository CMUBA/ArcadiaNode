// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/HeroNFT.sol";

interface IHeroNFT {
    function mint(address to, uint256 tokenId) external;
    function getDefaultNativePrice() external view returns (uint256);
}

contract InitMintNFTScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address heroNFTProxy = vm.envAddress("VITE_HERO_NFT_PROXY");
        address owner = vm.envAddress("VITE_CONTRACT_OWNER");

        vm.startBroadcast(deployerPrivateKey);

        IHeroNFT heroNFT = IHeroNFT(heroNFTProxy);
        uint256 price = heroNFT.getDefaultNativePrice();
        
        // 铸造第一个NFT，ID为1
        heroNFT.mint{value: price}(owner, 1);

        console.log("Minted NFT #1 to owner:", owner);
        console.log("Paid native token:", price);

        vm.stopBroadcast();
    }
}
