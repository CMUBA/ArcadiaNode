// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/MushroomToken.sol";

contract MushroomTokenTest is Test {
    MushroomToken public token;
    address public deployer;
    address public user1;
    address public user2;
    
    function setUp() public {
        // 使用一个固定的地址作为部署者
        deployer = address(this);
        user1 = address(0x1);
        user2 = address(0x2);
        
        // 部署代币合约
        token = new MushroomToken();
        
        // 从合约转移一些代币到测试账户用于测试
        token.transferFromContract(deployer, 1_000_000 * 10**18);
    }
    
    function test_InitialState() public {
        assertEq(token.name(), "Mushroom Token");
        assertEq(token.symbol(), "MUSH");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), 21_000_000 * 10**18);
        assertEq(token.balanceOf(address(token)), 20_000_000 * 10**18);
        assertEq(token.balanceOf(deployer), 1_000_000 * 10**18);
    }
    
    function test_Transfer() public {
        uint256 amount = 1000 * 10**18;
        
        // 测试转账
        token.transfer(user1, amount);
        assertEq(token.balanceOf(user1), amount);
        assertEq(token.balanceOf(deployer), 1_000_000 * 10**18 - amount);
        
        // 从 user1 转账到 user2
        vm.prank(user1);
        token.transfer(user2, amount / 2);
        assertEq(token.balanceOf(user1), amount / 2);
        assertEq(token.balanceOf(user2), amount / 2);
    }
    
    function test_TransferFrom() public {
        uint256 amount = 1000 * 10**18;
        
        // 批准 user1 使用代币
        token.approve(user1, amount);
        assertEq(token.allowance(deployer, user1), amount);
        
        // user1 从 deployer 转账到 user2
        vm.prank(user1);
        token.transferFrom(deployer, user2, amount);
        assertEq(token.balanceOf(user2), amount);
        assertEq(token.allowance(deployer, user1), 0);
    }
    
    function testFail_TransferWithoutBalance() public {
        vm.prank(user1);
        token.transfer(user2, 1); // user1 没有余额，应该失败
    }
    
    function testFail_TransferFromWithoutApproval() public {
        vm.prank(user1);
        token.transferFrom(deployer, user2, 1); // 没有授权，应该失败
    }
    
    function test_TotalSupplyLimit() public {
        assertEq(token.totalSupply(), 21_000_000 * 10**18);
        // 确保总供应量是固定的
        assertEq(token.totalSupply(), token.TOTAL_SUPPLY());
    }
    
    function test_TransferFromContract() public {
        uint256 amount = 1000 * 10**18;
        uint256 initialContractBalance = token.balanceOf(address(token));
        
        // 测试从合约转出代币
        token.transferFromContract(user1, amount);
        assertEq(token.balanceOf(user1), amount);
        assertEq(token.balanceOf(address(token)), initialContractBalance - amount);
    }
    
    function testFail_TransferFromContractNotOwner() public {
        vm.prank(user1);
        token.transferFromContract(user2, 1000 * 10**18); // 非 owner 调用应该失败
    }
} 