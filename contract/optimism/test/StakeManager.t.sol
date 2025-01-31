// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/StakeManager.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// 模拟的 ERC20 代币合约
contract MockToken is ERC20 {
    constructor() ERC20("Mock Token", "MTK") {
        _mint(msg.sender, 1000000 * 10**18); // 铸造 1,000,000 代币
    }
}

contract StakeManagerTest is Test {
    StakeManager public stakeManager;
    MockToken public token;
    address public deployer;
    address public user1;
    address public user2;
    address public penaltyReceiver;

    function setUp() public {
        deployer = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        penaltyReceiver = address(0x3);
        
        // 部署模拟代币
        token = new MockToken();
        
        // 部署质押合约
        stakeManager = new StakeManager(address(token));
        
        // 为测试账户转移代币
        token.transfer(user1, 10000 * 10**18);
        token.transfer(user2, 10000 * 10**18);
    }

    function test_InitialState() public {
        assertEq(address(stakeManager.stakingToken()), address(token));
        assertEq(stakeManager.totalStaked(), 0);
    }

    function test_Stake() public {
        uint256 stakeAmount = 1000 * 10**18;
        
        vm.startPrank(user1);
        token.approve(address(stakeManager), stakeAmount);
        stakeManager.stake(stakeAmount);
        vm.stopPrank();

        (
            uint256 amount,
            uint256 startTime,
            bool isActive,
            bool canUnstake,
            uint256 remainingLockTime
        ) = stakeManager.getStakeInfo(user1);

        assertEq(amount, stakeAmount);
        assertEq(startTime, block.timestamp);
        assertTrue(isActive);
        assertFalse(canUnstake);
        assertGt(remainingLockTime, 0);
        assertEq(stakeManager.totalStaked(), stakeAmount);
    }

    function test_CannotStakeTwice() public {
        uint256 stakeAmount = 1000 * 10**18;
        
        vm.startPrank(user1);
        token.approve(address(stakeManager), stakeAmount * 2);
        stakeManager.stake(stakeAmount);
        
        vm.expectRevert("Already staked");
        stakeManager.stake(stakeAmount);
        vm.stopPrank();
    }

    function test_UnstakeBeforeLockPeriod() public {
        uint256 stakeAmount = 1000 * 10**18;
        
        vm.startPrank(user1);
        token.approve(address(stakeManager), stakeAmount);
        stakeManager.stake(stakeAmount);
        
        vm.expectRevert("Lock period not ended");
        stakeManager.unstake();
        vm.stopPrank();
    }

    function test_UnstakeAfterLockPeriod() public {
        uint256 stakeAmount = 1000 * 10**18;
        
        vm.startPrank(user1);
        token.approve(address(stakeManager), stakeAmount);
        stakeManager.stake(stakeAmount);
        
        // 快进时间超过锁定期
        vm.warp(block.timestamp + 366 days);
        
        uint256 balanceBefore = token.balanceOf(user1);
        stakeManager.unstake();
        uint256 balanceAfter = token.balanceOf(user1);
        
        assertEq(balanceAfter - balanceBefore, stakeAmount);
        assertEq(stakeManager.totalStaked(), 0);
        vm.stopPrank();
    }

    function test_EmergencyUnstake() public {
        uint256 stakeAmount = 1000 * 10**18;
        uint256 penaltyPercent = 1000; // 10% 惩罚
        
        vm.startPrank(user1);
        token.approve(address(stakeManager), stakeAmount);
        stakeManager.stake(stakeAmount);
        
        uint256 expectedPenalty = (stakeAmount * penaltyPercent) / 10000;
        uint256 expectedReturn = stakeAmount - expectedPenalty;
        
        uint256 balanceBefore = token.balanceOf(user1);
        uint256 penaltyReceiverBefore = token.balanceOf(penaltyReceiver);
        
        stakeManager.emergencyUnstake(penaltyReceiver, penaltyPercent);
        
        uint256 balanceAfter = token.balanceOf(user1);
        uint256 penaltyReceiverAfter = token.balanceOf(penaltyReceiver);
        
        assertEq(balanceAfter - balanceBefore, expectedReturn);
        assertEq(penaltyReceiverAfter - penaltyReceiverBefore, expectedPenalty);
        assertEq(stakeManager.totalStaked(), 0);
        vm.stopPrank();
    }

    function test_PauseUnpause() public {
        stakeManager.pause();
        assertTrue(stakeManager.paused());
        
        vm.startPrank(user1);
        token.approve(address(stakeManager), 1000 * 10**18);
        
        vm.expectRevert("Pausable: paused");
        stakeManager.stake(1000 * 10**18);
        vm.stopPrank();
        
        stakeManager.unpause();
        assertFalse(stakeManager.paused());
    }
} 