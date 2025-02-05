// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol";

/**
 * @title HeroProxyAdmin
 * @dev 代理合约的管理合约，用于管理所有英雄相关合约的升级
 */
contract HeroProxyAdmin is ProxyAdmin {
    constructor() ProxyAdmin() {}
} 