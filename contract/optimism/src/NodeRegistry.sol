// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IStakeManager {
    function getStakeAmount(address account) external view returns (uint256);
}

contract NodeRegistry {
    // 最小 stake 数量
    uint256 public constant MIN_STAKE_AMOUNT = 1000 * 10**18; // 1000 tokens
    
    // Stake 管理合约地址
    address public stakeManager;
    
    // 定义节点数据结构
    struct NodeData {
        string ipOrDomain;
        string apiIndexes;
        uint256 stakedAmount;  // 新增：记录质押数量
        uint256 registeredAt;  // 新增：注册时间
    }

    // 节点注册表
    mapping(address => NodeData) public nodeRegistry;

    // 注册节点事件
    event NodeRegistered(address indexed nodeAddress, string ipOrDomain, string apiIndexes, uint256 stakedAmount);

    constructor(address _stakeManager) {
        stakeManager = _stakeManager;
    }

    // 验证 stake 数量
    function validateStake(address /* nodeAddress */) public view returns (bool) {
        // TODO: Phase 1 - 初期直接返回 true
        if (stakeManager == address(0)) {
            return true;
        }

        // TODO: Phase 2 - 后期实现以下逻辑
        // IStakeManager stake = IStakeManager(stakeManager);
        // uint256 stakedAmount = stake.getStakeAmount(nodeAddress);
        // return stakedAmount >= MIN_STAKE_AMOUNT;
        return true;
    }

    // 注册节点函数
    function registerNode(string memory ipOrDomain, string memory apiIndexes) public {
        // 验证 stake 数量
        require(validateStake(msg.sender), "Insufficient stake amount");

        // TODO: Phase 2 - 获取实际质押数量
        uint256 stakedAmount = 0; // 后期从 stakeManager 获取
        
        // 将节点数据存储在注册表中
        nodeRegistry[msg.sender] = NodeData(
            ipOrDomain, 
            apiIndexes,
            stakedAmount,
            block.timestamp
        );

        // 触发节点注册事件
        emit NodeRegistered(msg.sender, ipOrDomain, apiIndexes, stakedAmount);
    }

    // 获取节点数据函数
    function getNodeData(address nodeAddress) public view returns (
        string memory ipOrDomain,
        string memory apiIndexes,
        uint256 stakedAmount,
        uint256 registeredAt
    ) {
        NodeData memory nodeData = nodeRegistry[nodeAddress];
        return (
            nodeData.ipOrDomain,
            nodeData.apiIndexes,
            nodeData.stakedAmount,
            nodeData.registeredAt
        );
    }

    // 更新 stake 管理合约地址（仅管理员可调用）
    // function updateStakeManager(address _stakeManager) public {
    //     // TODO: 添加管理员权限控制
    //     stakeManager = _stakeManager;
    // }
} 