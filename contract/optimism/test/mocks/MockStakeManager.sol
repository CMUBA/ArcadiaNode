// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockStakeManager {
    mapping(address => uint256) private stakes;

    function setStakeAmount(address account, uint256 amount) external {
        stakes[account] = amount;
    }

    function getStakeAmount(address account) external view returns (uint256) {
        return stakes[account];
    }
} 