// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract NodeRegistry {
    // 定义节点数据结构
    struct NodeData {
        string ipOrDomain;
        string apiIndexes;
    }

    // 节点注册表
    mapping(address => NodeData) public nodeRegistry;

    // 注册节点事件
    event NodeRegistered(address indexed nodeAddress, string ipOrDomain, string apiIndexes);

    // 注册节点函数
    function registerNode(string memory ipOrDomain, string memory apiIndexes) public {
        // 将节点数据存储在注册表中
        nodeRegistry[msg.sender] = NodeData(ipOrDomain, apiIndexes);

        // 触发节点注册事件
        emit NodeRegistered(msg.sender, ipOrDomain, apiIndexes);
    }

    // 获取节点数据函数
    function getNodeData(address nodeAddress) public view returns (string memory, string memory) {
        NodeData memory nodeData = nodeRegistry[nodeAddress];
        return (nodeData.ipOrDomain, nodeData.apiIndexes);
    }
} 