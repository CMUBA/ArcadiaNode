// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

contract CheckDeployerScript is Script {
    function run() external view {
        bytes32 privateKeyHash = vm.envBytes32("HERO_PRIVATE_KEY");
        uint256 deployerPrivateKey = uint256(privateKeyHash);
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("\nDeployer address from private key:", deployer);
        console.log("Expected owner address: 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA");
        console.log("Addresses match:", deployer == 0xe24b6f321B0140716a2b671ed0D983bb64E7DaFA);
    }
}
