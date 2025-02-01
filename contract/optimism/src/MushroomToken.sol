// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MushroomToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 21_000_000 * 10**18; // 21 million tokens with 18 decimals

    constructor() ERC20("Mushroom Token", "MUSH") {
        _mint(address(this), TOTAL_SUPPLY);
    }

    // 添加任何需要 owner 权限的函数
    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }

    // 允许 owner 从合约转出代币
    function transferFromContract(address to, uint256 amount) public onlyOwner {
        _transfer(address(this), to, amount);
    }
} 