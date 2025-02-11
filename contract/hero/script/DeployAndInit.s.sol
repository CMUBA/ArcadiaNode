// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/core/Hero.sol";
import "../src/core/HeroNFT.sol";
import "../src/core/HeroMetadata.sol";
import "../src/proxy/HeroProxy.sol";
import "../src/proxy/ProxyAdmin.sol";

contract DeployAndInitScript is Script {
    ProxyAdmin public proxyAdmin;
    HeroNFT public heroNFTImpl;
    Hero public heroImpl;
    HeroMetadata public heroMetadataImpl;
    HeroProxy public heroNFTProxy;
    HeroProxy public heroProxy;
    HeroProxy public heroMetadataProxy;

    function run() external {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy ProxyAdmin and Implementation contracts
        proxyAdmin = new ProxyAdmin();
        console.log("ProxyAdmin deployed to:", address(proxyAdmin));

        // Deploy implementation contracts with required parameters
        address defaultToken = address(0); // Use zero address as default token
        uint256 nativePrice = 0.01 ether;  // Set default native token price
        uint256 tokenPrice = 100 * 10**18; // Set default token price
        
        heroNFTImpl = new HeroNFT(
            defaultToken,
            nativePrice,
            tokenPrice
        );
        heroImpl = new Hero();
        heroMetadataImpl = new HeroMetadata();

        // Deploy proxies without initialization
        heroNFTProxy = new HeroProxy(
            address(heroNFTImpl),
            ""  // Empty data since we don't need initialization
        );
        console.log("HeroNFT Proxy deployed to:", address(heroNFTProxy));

        heroProxy = new HeroProxy(
            address(heroImpl),
            ""  // Empty data since we don't need initialization
        );
        console.log("Hero Proxy deployed to:", address(heroProxy));

        heroMetadataProxy = new HeroProxy(
            address(heroMetadataImpl),
            ""  // Empty data since we don't need initialization
        );
        console.log("HeroMetadata Proxy deployed to:", address(heroMetadataProxy));

        // 3. Initialize Metadata
        HeroMetadata metadata = HeroMetadata(address(heroMetadataProxy));
        
        // Set initial skills (简化版本，实际应该从配置文件读取)
        metadata.setSkill(0, 0, 1, "Eagle Eye", 2, true);
        metadata.setSkill(0, 1, 1, "Spider Sense", 1, true);
        metadata.setSkill(0, 2, 1, "Holy Counter", 1, true);

        // 4. Register NFT contract in Hero
        Hero hero = Hero(address(heroProxy));
        hero.registerNFT(address(heroNFTProxy), true);
        console.log("Registered NFT contract in Hero");

        // 5. Mint first test NFT
        uint256 mintPrice = 0.01 ether;
        address defaultSender = vm.addr(1);
        
        try HeroNFT(address(heroNFTProxy)).mint{value: mintPrice}(defaultSender, 1) {
            console.log("Successfully minted first NFT");
        } catch Error(string memory reason) {
            console.log("Failed to mint NFT");
            console.log("Reason:", reason);
        }

        vm.stopBroadcast();
        
        // Output addresses
        outputAddresses();
    }

    function outputAddresses() internal view {
        console.log("\n# Hero Deployed Contract Addresses");
        console.log("VITE_HERO_NFT_PROXY=%s", address(heroNFTProxy));
        console.log("VITE_HERO_NFT_IMPLEMENTATION=%s", address(heroNFTImpl));
        console.log("VITE_PROXY_ADMIN=%s\n", address(proxyAdmin));

        console.log("VITE_HERO_METADATA_PROXY=%s", address(heroMetadataProxy));
        console.log("VITE_HERO_METADATA_IMPLEMENTATION=%s", address(heroMetadataImpl));
        console.log("VITE_HERO_METADATA_PROXY_ADMIN=%s\n", address(proxyAdmin));

        console.log("VITE_HERO_PROXY=%s", address(heroProxy));
        console.log("VITE_HERO_IMPLEMENTATION=%s", address(heroImpl));
        console.log("VITE_HERO_PROXY_ADMIN=%s", address(proxyAdmin));
    }
}
