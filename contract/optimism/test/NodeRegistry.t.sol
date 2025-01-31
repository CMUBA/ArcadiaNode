// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/NodeRegistry.sol";

contract MockStakeManager {
    mapping(address => uint256) public stakes;

    function setStake(address account, uint256 amount) public {
        stakes[account] = amount;
    }

    function getStakeAmount(address account) external view returns (uint256) {
        return stakes[account];
    }
}

contract NodeRegistryTest is Test {
    NodeRegistry public registry;
    MockStakeManager public stakeManager;
    address public deployer;
    address public user1;
    address public user2;

    function setUp() public {
        deployer = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        
        // 部署 MockStakeManager
        stakeManager = new MockStakeManager();
        
        // 部署 NodeRegistry
        registry = new NodeRegistry(address(stakeManager));
        
        // 为测试账户设置初始 stake
        stakeManager.setStake(user1, 2000 * 10**18); // 2000 tokens
        stakeManager.setStake(user2, 500 * 10**18);  // 500 tokens
    }

    function test_InitialState() public view {
        assertEq(address(registry.stakeManager()), address(stakeManager));
    }

    function test_RegisterNode() public {
        vm.startPrank(user1);
        
        string memory ipOrDomain = "https://node1.example.com";
        string memory apiIndexes = '["api1", "api2"]';
        
        registry.registerNode(ipOrDomain, apiIndexes);
        
        (
            string memory storedIp,
            string memory storedApi,
            uint256 stakedAmount,
            uint256 registeredAt
        ) = registry.getNodeData(user1);
        
        assertEq(storedIp, ipOrDomain);
        assertEq(storedApi, apiIndexes);
        assertEq(stakedAmount, 0); // Phase 1: 暂时为0
        assertTrue(registeredAt > 0);
        
        vm.stopPrank();
    }

    function test_RegisterMultipleNodes() public {
        vm.startPrank(user1);
        registry.registerNode("https://node1.example.com", '["api1"]');
        vm.stopPrank();

        vm.startPrank(user2);
        registry.registerNode("https://node2.example.com", '["api2"]');
        vm.stopPrank();

        (string memory ip1,,, ) = registry.getNodeData(user1);
        (string memory ip2,,, ) = registry.getNodeData(user2);

        assertEq(ip1, "https://node1.example.com");
        assertEq(ip2, "https://node2.example.com");
    }

    function test_ValidateStake() public view {
        bool isValid = registry.validateStake(user1);
        assertTrue(isValid); // Phase 1: 应该总是返回 true

        isValid = registry.validateStake(user2);
        assertTrue(isValid); // Phase 1: 应该总是返回 true
    }

    function test_GetNodeData_NonExistentNode() public view {
        (
            string memory ipOrDomain,
            string memory apiIndexes,
            uint256 stakedAmount,
            uint256 registeredAt
        ) = registry.getNodeData(address(0x999));

        assertEq(ipOrDomain, "");
        assertEq(apiIndexes, "");
        assertEq(stakedAmount, 0);
        assertEq(registeredAt, 0);
    }

    // TODO: Phase 2 测试
    // function test_StakeValidation() public {
    //     // 这些测试将在 Phase 2 实现
    //     // 测试质押不足的情况
    //     // 测试质押足够的情况
    //     // 测试质押金额更新后的情况
    // }
} 