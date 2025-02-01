// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "src/MushroomToken.sol";

contract MushroomTokenScript is Script {
    function run() external {
        string memory deployerPrivateKey = vm.envString("DEPLOYER_PRIVATE_KEY");
        uint256 privateKey = vm.parseUint(deployerPrivateKey);
        
        vm.startBroadcast(privateKey);
        
        // 部署代币合约
        MushroomToken token = new MushroomToken();
        
        // 转账 10 万代币给部署者
        address deployer = vm.addr(privateKey);
        token.transfer(deployer, 100_000 * 10**18);
        
        vm.stopBroadcast();
        
        console.log("MushroomToken deployed at:", address(token));
    }
} 