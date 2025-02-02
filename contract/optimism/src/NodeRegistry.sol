// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

interface IStakeManager {
    function getStakeAmount(address account) external view returns (uint256);
}

contract NodeRegistry is ReentrancyGuard {
    using ECDSA for bytes32;

    // 最小 stake 数量
    uint256 public constant MIN_STAKE_AMOUNT = 1000 * 10**18; // 1000 tokens
    
    // Stake 管理合约地址
    address public immutable stakeManager;
    
    // 节点信息结构
    struct NodeInfo {
        string ipOrDomain;
        string apiIndexes;  // 使用标准API的index列表，例如 "[1,2,3]"
        uint256 registeredAt;
    }

    // 存储节点信息
    mapping(address => NodeInfo) public nodes;

    // 事件
    event NodeRegistered(
        address indexed nodeAddress,
        address indexed registrarAddress,
        string ipOrDomain,
        string apiIndexes
    );

    constructor(
        address _stakeManager,
        string memory _ipOrDomain,
        string memory _apiIndexes
    ) {
        require(_stakeManager != address(0), "Invalid stake manager address");
        stakeManager = _stakeManager;

        // 验证注册服务者的质押数量
        require(validateStake(msg.sender), "Deployer insufficient stake amount");

        // 将合约部署者设置为第一个注册节点
        nodes[msg.sender] = NodeInfo({
            ipOrDomain: _ipOrDomain,
            apiIndexes: _apiIndexes,
            registeredAt: block.timestamp
        });

        emit NodeRegistered(msg.sender, msg.sender, _ipOrDomain, _apiIndexes);
    }

    // 验证 stake 数量
    function validateStake(address nodeAddress) public view returns (bool) {
        if (stakeManager == address(0)) {
            return true;
        }
        IStakeManager stake = IStakeManager(stakeManager);
        uint256 stakedAmount = stake.getStakeAmount(nodeAddress);
        return stakedAmount >= MIN_STAKE_AMOUNT;
    }

    // 验证签名
    function verifySignature(
        address signer,
        bytes32 challenge,
        bytes memory signature
    ) internal pure returns (bool) {
        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", challenge)
        );
        return messageHash.recover(signature) == signer;
    }

    // 注册节点（只能由已注册节点调用）
    function registerNode(
        address nodeAddress,
        string memory ipOrDomain,
        string memory apiIndexes,
        bytes32 challenge,
        bytes memory signature
    ) 
        external 
        nonReentrant 
    {
        // 验证注册者必须是已注册节点
        require(nodes[msg.sender].registeredAt > 0, "Registrar not registered");
        
        // 验证新节点未注册
        require(nodes[nodeAddress].registeredAt == 0, "Node already registered");

        // 验证签名（确保 nodeAddress 拥有私钥）
        require(verifySignature(nodeAddress, challenge, signature), "Invalid signature");

        // 验证新节点的质押数量
        require(validateStake(nodeAddress), "Insufficient stake amount");

        // 注册新节点
        nodes[nodeAddress] = NodeInfo({
            ipOrDomain: ipOrDomain,
            apiIndexes: apiIndexes,
            registeredAt: block.timestamp
        });

        emit NodeRegistered(nodeAddress, msg.sender, ipOrDomain, apiIndexes);
    }

    // 获取节点信息
    function getNodeInfo(address nodeAddress) 
        external 
        view 
        returns (
            string memory ipOrDomain,
            string memory apiIndexes,
            uint256 registeredAt
        ) 
    {
        NodeInfo memory node = nodes[nodeAddress];
        return (
            node.ipOrDomain,
            node.apiIndexes,
            node.registeredAt
        );
    }

    // 检查节点是否已注册
    function isRegistered(address nodeAddress) external view returns (bool) {
        return nodes[nodeAddress].registeredAt > 0;
    }
} 