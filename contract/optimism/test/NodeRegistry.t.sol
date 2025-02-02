// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/NodeRegistry.sol";

contract MockStakeManager {
    mapping(address => uint256) public stakes;
    
    function setStake(address account, uint256 amount) external {
        stakes[account] = amount;
    }
    
    function getStakeAmount(address account) external view returns (uint256) {
        return stakes[account];
    }
}

contract NodeRegistryTest is Test {
    NodeRegistry public registry;
    MockStakeManager public stakeManager;
    
    // 使用固定的私钥和对应的地址
    uint256 constant DEPLOYER_PRIVATE_KEY = 1;
    uint256 constant NODE1_PRIVATE_KEY = 2;
    uint256 constant NODE2_PRIVATE_KEY = 3;
    
    address public deployer;
    address public node1;
    address public node2;
    
    uint256 public constant MIN_STAKE = 1000 * 10**18;
    string public constant DEFAULT_IP = "127.0.0.1:8080";
    string public constant DEFAULT_API = "[1,2,3]";
    
    function setUp() public {
        // 使用私钥生成对应的地址
        deployer = vm.addr(DEPLOYER_PRIVATE_KEY);
        node1 = vm.addr(NODE1_PRIVATE_KEY);
        node2 = vm.addr(NODE2_PRIVATE_KEY);
        
        vm.startPrank(deployer);
        
        // Deploy mock stake manager
        stakeManager = new MockStakeManager();
        stakeManager.setStake(deployer, MIN_STAKE);
        
        // Deploy node registry
        registry = new NodeRegistry(
            address(stakeManager),
            DEFAULT_IP,
            DEFAULT_API
        );
        
        vm.stopPrank();
    }
    
    function test_Constructor() public {
        assertEq(registry.stakeManager(), address(stakeManager));
        
        (string memory ip, string memory api, uint256 regTime) = registry.getNodeInfo(deployer);
        assertEq(ip, DEFAULT_IP);
        assertEq(api, DEFAULT_API);
        assertGt(regTime, 0);
        
        assertTrue(registry.isRegistered(deployer));
        assertEq(registry.getRegisteredNodesCount(), 1);
    }
    
    function test_RegisterNode() public {
        // Setup node1 stake
        stakeManager.setStake(node1, MIN_STAKE);
        
        // Generate challenge and signature
        bytes32 challenge = keccak256(abi.encodePacked("challenge"));
        
        // 使用 node1 的私钥签名
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", challenge)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(NODE1_PRIVATE_KEY, messageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        // Register node1 by deployer
        vm.prank(deployer);
        registry.registerNode(
            node1,
            "node1.example.com",
            "[4,5,6]",
            challenge,
            signature
        );
        
        // Verify registration
        assertTrue(registry.isRegistered(node1));
        assertEq(registry.getRegisteredNodesCount(), 2);
        
        (string memory ip, string memory api, uint256 regTime) = registry.getNodeInfo(node1);
        assertEq(ip, "node1.example.com");
        assertEq(api, "[4,5,6]");
        assertGt(regTime, 0);
    }
    
    function test_GetNodesInfo() public {
        // Register multiple nodes
        address[] memory nodes = new address[](3);
        nodes[0] = deployer; // already registered in setUp
        nodes[1] = node1;
        nodes[2] = node2;
        
        // Setup stakes and register nodes
        for(uint i = 1; i < nodes.length; i++) {
            stakeManager.setStake(nodes[i], MIN_STAKE);
            
            bytes32 challenge = keccak256(abi.encodePacked("challenge", i));
            bytes32 messageHash = keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", challenge)
            );
            
            // 使用对应节点的私钥签名
            (uint8 v, bytes32 r, bytes32 s) = vm.sign(i + 1, messageHash);
            bytes memory signature = abi.encodePacked(r, s, v);
            
            vm.prank(deployer);
            registry.registerNode(
                nodes[i],
                string(abi.encodePacked("node", vm.toString(i), ".example.com")),
                string(abi.encodePacked("[", vm.toString(i), "]")),
                challenge,
                signature
            );
        }
        
        // Test pagination
        (
            address[] memory addresses,
            string[] memory ips,
            string[] memory apis,
            uint256[] memory times
        ) = registry.getNodesInfo(0, 2);
        
        assertEq(addresses.length, 2);
        assertEq(addresses[0], deployer);
        assertEq(addresses[1], node1);
        
        // Test second page
        (addresses, ips, apis, times) = registry.getNodesInfo(2, 2);
        assertEq(addresses.length, 1);
        assertEq(addresses[0], node2);
    }
    
    function testFail_RegisterWithoutStake() public {
        bytes32 challenge = keccak256(abi.encodePacked("challenge"));
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", challenge)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(NODE1_PRIVATE_KEY, messageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.prank(deployer);
        registry.registerNode(
            node1,
            "node1.example.com",
            "[4,5,6]",
            challenge,
            signature
        );
    }
    
    function testFail_RegisterByNonRegisteredNode() public {
        stakeManager.setStake(node1, MIN_STAKE);
        
        bytes32 challenge = keccak256(abi.encodePacked("challenge"));
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", challenge)
        );
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(NODE1_PRIVATE_KEY, messageHash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        vm.prank(node2); // non-registered node
        registry.registerNode(
            node1,
            "node1.example.com",
            "[4,5,6]",
            challenge,
            signature
        );
    }
} 