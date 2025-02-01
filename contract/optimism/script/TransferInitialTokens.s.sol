// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "../src/MushroomToken.sol";

contract TransferInitialTokensScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address tokenAddress = vm.envAddress("TOKEN_CONTRACT_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        MushroomToken token = MushroomToken(tokenAddress);
        address deployer = vm.addr(deployerPrivateKey);
        
        // 从合约转 10 万代币给部署者
        token.transferFromContract(deployer, 100_000 * 10**18);
        
        vm.stopBroadcast();
        
        console.log("Transferred 100,000 tokens to deployer:", deployer);
    }
}
