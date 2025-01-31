// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title StakeManager
 * @dev 管理节点质押的合约，包含1年锁定期和退出机制
 */
contract StakeManager is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // 质押代币
    IERC20 public immutable stakingToken;
    
    // 锁定期（1年）
    uint256 public constant LOCK_PERIOD = 365 days;
    
    // 质押信息结构
    struct StakeInfo {
        uint256 amount;        // 质押数量
        uint256 startTime;     // 质押开始时间
        bool isActive;         // 是否处于活跃状态
    }
    
    // 用户地址 => 质押信息
    mapping(address => StakeInfo) public stakes;
    
    // 总质押量
    uint256 public totalStaked;
    
    // 事件
    event Staked(address indexed user, uint256 amount, uint256 startTime);
    event Unstaked(address indexed user, uint256 amount, uint256 endTime);
    event EmergencyUnstaked(address indexed user, uint256 amount, uint256 time);
    
    /**
     * @dev 构造函数
     * @param _stakingToken 质押代币地址
     */
    constructor(address _stakingToken) {
        require(_stakingToken != address(0), "Invalid token address");
        stakingToken = IERC20(_stakingToken);
    }
    
    /**
     * @dev 质押代币
     * @param amount 质押数量
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(!stakes[msg.sender].isActive, "Already staked");
        
        // 转移代币到合约
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // 更新质押信息
        stakes[msg.sender] = StakeInfo({
            amount: amount,
            startTime: block.timestamp,
            isActive: true
        });
        
        totalStaked += amount;
        
        emit Staked(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev 解除质押（需要满足锁定期）
     */
    function unstake() external nonReentrant {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.isActive, "No active stake");
        require(block.timestamp >= userStake.startTime + LOCK_PERIOD, "Lock period not ended");
        
        uint256 amount = userStake.amount;
        
        // 清除质押信息
        userStake.amount = 0;
        userStake.isActive = false;
        
        totalStaked -= amount;
        
        // 返还代币
        stakingToken.safeTransfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev 紧急解除质押（可能会有惩罚）
     * @param penaltyReceiver 惩罚金接收地址
     * @param penaltyPercent 惩罚比例（基数为10000，即100%）
     */
    function emergencyUnstake(address penaltyReceiver, uint256 penaltyPercent) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(penaltyPercent <= 10000, "Invalid penalty percentage");
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.isActive, "No active stake");
        
        uint256 amount = userStake.amount;
        uint256 penaltyAmount = (amount * penaltyPercent) / 10000;
        uint256 returnAmount = amount - penaltyAmount;
        
        // 清除质押信息
        userStake.amount = 0;
        userStake.isActive = false;
        
        totalStaked -= amount;
        
        // 转移惩罚金
        if (penaltyAmount > 0) {
            stakingToken.safeTransfer(penaltyReceiver, penaltyAmount);
        }
        
        // 返还剩余代币
        stakingToken.safeTransfer(msg.sender, returnAmount);
        
        emit EmergencyUnstaked(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev 获取用户质押信息
     * @param user 用户地址
     */
    function getStakeInfo(address user) 
        external 
        view 
        returns (
            uint256 amount,
            uint256 startTime,
            bool isActive,
            bool canUnstake,
            uint256 remainingLockTime
        ) 
    {
        StakeInfo memory userStake = stakes[user];
        uint256 endTime = userStake.startTime + LOCK_PERIOD;
        
        return (
            userStake.amount,
            userStake.startTime,
            userStake.isActive,
            block.timestamp >= endTime,
            block.timestamp >= endTime ? 0 : endTime - block.timestamp
        );
    }
    
    /**
     * @dev 获取用户质押数量
     * @param user 用户地址
     */
    function getStakeAmount(address user) external view returns (uint256) {
        return stakes[user].isActive ? stakes[user].amount : 0;
    }
    
    /**
     * @dev 暂停合约（仅所有者）
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约（仅所有者）
     */
    function unpause() external onlyOwner {
        _unpause();
    }
} 