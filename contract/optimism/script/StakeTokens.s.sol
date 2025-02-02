// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/MushroomToken.sol";
import "../src/StakeManager.sol";

contract StakeTokensScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address tokenAddress = vm.envAddress("TOKEN_CONTRACT_ADDRESS");
        address stakeManagerAddress = vm.envAddress("STAKE_MANAGER_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        MushroomToken token = MushroomToken(tokenAddress);
        StakeManager stakeManager = StakeManager(stakeManagerAddress);
        address deployer = vm.addr(deployerPrivateKey);
        
        uint256 stakeAmount = 1000 * 10**18; // 质押 1000 代币
        
        // 先授权 StakeManager 使用代币
        token.approve(stakeManagerAddress, stakeAmount);
        
        // 质押代币
        stakeManager.stake(stakeAmount);
        
        // 获取并打印质押后的余额
        uint256 amount = stakeManager.getStakeAmount(deployer);
        
        vm.stopBroadcast();
        
        console.log("Staked 1000 tokens from deployer: %s", deployer);
        console.log("New stake balance: %d", amount);
    }
}
