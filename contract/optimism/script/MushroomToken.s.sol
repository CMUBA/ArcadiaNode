// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/MushroomToken.sol";

contract MushroomTokenScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // 部署代币合约
        MushroomToken token = new MushroomToken();
        
        // 从合约转 10 万代币给部署者
        address deployer = vm.addr(deployerPrivateKey);
        token.transferFromContract(deployer, 100_000 * 10**18);
        
        vm.stopBroadcast();
        
        console.log("MushroomToken deployed at:", address(token));
    }
} 