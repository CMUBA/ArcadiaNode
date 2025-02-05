// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title HeroProxy
 * @dev 英雄合约的代理合约，使用 ERC1967 代理标准
 */
contract HeroProxy is ERC1967Proxy {
    /**
     * @dev 构造函数
     * @param _logic 实现合约地址
     * @param _data 初始化调用数据
     */
    constructor(
        address _logic,
        bytes memory _data
    ) ERC1967Proxy(_logic, _data) {}
} 