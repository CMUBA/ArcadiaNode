// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/NodeRegistry.sol";
import "./mocks/MockStakeManager.sol";

contract NodeRegistryTest is Test {
    NodeRegistry public registry;
    MockStakeManager public stakeManager;
    
    // 从环境变量获取的私钥
    uint256 private nodePrivateKey;
    uint256 private newNodePrivateKey;
    address private nodeAddress;
    address private newNodeAddress;
    
    // 测试常量
    string constant DEPLOYER_IP = "https://deployer.example.com";
    string constant DEPLOYER_APIS = "[1,2,3,4,5]";
    string constant NEW_NODE_IP = "https://newnode.example.com";
    string constant NEW_NODE_APIS = "[1,2,3]";
    bytes32 constant TEST_CHALLENGE = bytes32("test_challenge");
    
    function setUp() public {
        // 从环境变量加载私钥
        string memory nodePrivKeyStr = vm.envString("NODE_PRIVATE_KEY");
        string memory newNodePrivKeyStr = vm.envString("NEW_NODE_PRIVATE_KEY");
        
        // 添加0x前缀并解析私钥
        nodePrivateKey = vm.parseUint(string.concat("0x", nodePrivKeyStr));
        newNodePrivateKey = vm.parseUint(string.concat("0x", newNodePrivKeyStr));
        
        // 从私钥计算地址
        nodeAddress = vm.addr(nodePrivateKey);
        newNodeAddress = vm.addr(newNodePrivateKey);
        
        // 部署 MockStakeManager
        stakeManager = new MockStakeManager();
        
        // 设置质押金额
        stakeManager.setStakeAmount(nodeAddress, 2000 * 10**18);
        stakeManager.setStakeAmount(newNodeAddress, 1500 * 10**18);
        
        // 使用注册服务节点部署 NodeRegistry
        vm.prank(nodeAddress);
        registry = new NodeRegistry(
            address(stakeManager),
            DEPLOYER_IP,
            DEPLOYER_APIS
        );
    }
    
    function test_InitialState() public {
        (string memory ip, string memory apis, uint256 regTime) = registry.getNodeInfo(nodeAddress);
        assertEq(ip, DEPLOYER_IP);
        assertEq(apis, DEPLOYER_APIS);
        assertTrue(regTime > 0);
        assertTrue(registry.isRegistered(nodeAddress));
    }
    
    function test_RegisterNode() public {
        // 生成签名
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", TEST_CHALLENGE)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(newNodePrivateKey, messageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        // 使用注册服务节点注册新节点
        vm.prank(nodeAddress);
        registry.registerNode(
            newNodeAddress,
            NEW_NODE_IP,
            NEW_NODE_APIS,
            TEST_CHALLENGE,
            signature
        );
        
        assertTrue(registry.isRegistered(newNodeAddress));
        
        // 验证注册后的节点信息
        (string memory ip, string memory apis, uint256 regTime) = registry.getNodeInfo(newNodeAddress);
        assertEq(ip, NEW_NODE_IP);
        assertEq(apis, NEW_NODE_APIS);
        assertTrue(regTime > 0);
    }
    
    function testFail_RegisterWithInsufficientStake() public {
        // 设置质押金额不足
        stakeManager.setStakeAmount(newNodeAddress, 500 * 10**18);
        
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", TEST_CHALLENGE)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(newNodePrivateKey, messageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.prank(nodeAddress);
        registry.registerNode(
            newNodeAddress,
            NEW_NODE_IP,
            NEW_NODE_APIS,
            TEST_CHALLENGE,
            signature
        );
    }
    
    function testFail_RegisterByUnregisteredNode() public {
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", TEST_CHALLENGE)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(newNodePrivateKey, messageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        // 使用未注册的节点尝试注册新节点
        vm.prank(newNodeAddress);
        registry.registerNode(
            address(3),
            NEW_NODE_IP,
            NEW_NODE_APIS,
            TEST_CHALLENGE,
            signature
        );
    }
    
    function testFail_RegisterWithInvalidSignature() public {
        // 使用错误的私钥签名（这里使用nodePrivateKey来签名，而不是newNodePrivateKey）
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", TEST_CHALLENGE)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(nodePrivateKey, messageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.prank(nodeAddress);
        registry.registerNode(
            newNodeAddress,
            NEW_NODE_IP,
            NEW_NODE_APIS,
            TEST_CHALLENGE,
            signature
        );
    }
} 