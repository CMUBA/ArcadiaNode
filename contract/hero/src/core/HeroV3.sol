// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract HeroV3 is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    // 状态变量
    address public officialNFT;                    // 官方NFT合约地址
    mapping(address => bool) public isRegistered;  // NFT注册状态
    address[] private registeredNFTs;              // 已注册的NFT列表
    string public VERSION;                         // 版本号

    // 英雄记录结构
    struct HeroRecord {
        string name;
        string description;
        string[] attributes;
        uint256[] values;
        uint256 level;
        uint256 experience;
        string[] skills;
        uint256[] skillLevels;
        uint256 lastUpdateTime;
        bool isActive;
    }

    // 英雄记录映射：NFT合约地址 => tokenId => 英雄记录
    mapping(address => mapping(uint256 => HeroRecord)) private heroRecords;

    // 事件
    event NFTRegistered(address indexed nftContract, bool isOfficial);
    event NFTUnregistered(address indexed nftContract);
    event HeroRecordCreated(address indexed nftContract, uint256 indexed tokenId);
    event HeroRecordUpdated(address indexed nftContract, uint256 indexed tokenId);
    event HeroLevelUp(address indexed nftContract, uint256 indexed tokenId, uint256 newLevel);
    event SkillLevelUp(address indexed nftContract, uint256 indexed tokenId, string skill, uint256 newLevel);

    function initialize() public reinitializer(3) {
        __Ownable_init();
        __UUPSUpgradeable_init();
        VERSION = "3.0.0";
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    /**
     * @dev 注册NFT合约
     * @param nftContract NFT合约地址
     * @param isOfficial 是否为官方NFT
     */
    function registerNFT(address nftContract, bool isOfficial) external onlyOwner {
        require(nftContract != address(0), "Invalid NFT address");
        require(!isRegistered[nftContract], "NFT already registered");
        
        if (isOfficial) {
            require(officialNFT == address(0), "Official NFT already set");
            officialNFT = nftContract;
        }
        
        isRegistered[nftContract] = true;
        registeredNFTs.push(nftContract);
        
        emit NFTRegistered(nftContract, isOfficial);
    }

    function unregisterNFT(address nftContract) external onlyOwner {
        require(isRegistered[nftContract], "NFT not registered");
        require(nftContract != officialNFT, "Cannot unregister official NFT");
        
        isRegistered[nftContract] = false;
        
        // 从列表中移除
        for (uint i = 0; i < registeredNFTs.length; i++) {
            if (registeredNFTs[i] == nftContract) {
                registeredNFTs[i] = registeredNFTs[registeredNFTs.length - 1];
                registeredNFTs.pop();
                break;
            }
        }
        
        emit NFTUnregistered(nftContract);
    }

    /**
     * @dev 获取已注册的NFT列表
     * @return 已注册的NFT地址列表
     */
    function getRegisteredNFTs() external view returns (address[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < registeredNFTs.length; i++) {
            if (isRegistered[registeredNFTs[i]]) {
                count++;
            }
        }
        
        address[] memory activeNFTs = new address[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < registeredNFTs.length; i++) {
            if (isRegistered[registeredNFTs[i]]) {
                activeNFTs[index] = registeredNFTs[i];
                index++;
            }
        }
        
        return activeNFTs;
    }

    /**
     * @dev 创建或更新英雄记录
     */
    function registerHeroRecord(
        address nftContract,
        uint256 tokenId,
        string memory name,
        string memory description,
        string[] memory attributes,
        uint256[] memory values
    ) external {
        require(isRegistered[nftContract], "NFT not registered");
        require(attributes.length == values.length, "Length mismatch");
        
        HeroRecord storage record = heroRecords[nftContract][tokenId];
        
        if (!record.isActive) {
            // 新记录
            record.name = name;
            record.description = description;
            record.attributes = attributes;
            record.values = values;
            record.level = 1;
            record.experience = 0;
            record.skills = new string[](0);
            record.skillLevels = new uint256[](0);
            record.lastUpdateTime = block.timestamp;
            record.isActive = true;
            
            emit HeroRecordCreated(nftContract, tokenId);
        } else {
            // 更新记录
            record.name = name;
            record.description = description;
            record.attributes = attributes;
            record.values = values;
            record.lastUpdateTime = block.timestamp;
            
            emit HeroRecordUpdated(nftContract, tokenId);
        }
    }

    /**
     * @dev 获取英雄记录
     */
    function getHeroRecord(address nftContract, uint256 tokenId) external view returns (
        string memory name,
        string memory description,
        string[] memory attributes,
        uint256[] memory values
    ) {
        require(isRegistered[nftContract], "NFT not registered");
        HeroRecord storage record = heroRecords[nftContract][tokenId];
        require(record.isActive, "Hero record not found");
        
        return (
            record.name,
            record.description,
            record.attributes,
            record.values
        );
    }

    /**
     * @dev 获取英雄等级和经验
     */
    function getHeroLevel(address nftContract, uint256 tokenId) external view returns (
        uint256 level,
        uint256 experience
    ) {
        require(isRegistered[nftContract], "NFT not registered");
        HeroRecord storage record = heroRecords[nftContract][tokenId];
        require(record.isActive, "Hero record not found");
        
        return (record.level, record.experience);
    }

    /**
     * @dev 获取英雄技能
     */
    function getHeroSkills(address nftContract, uint256 tokenId) external view returns (
        string[] memory skills,
        uint256[] memory levels
    ) {
        require(isRegistered[nftContract], "NFT not registered");
        HeroRecord storage record = heroRecords[nftContract][tokenId];
        require(record.isActive, "Hero record not found");
        
        return (record.skills, record.skillLevels);
    }

    /**
     * @dev 添加或升级技能
     */
    function upgradeSkill(
        address nftContract,
        uint256 tokenId,
        string memory skillName,
        uint256 newLevel
    ) external onlyOwner {
        require(isRegistered[nftContract], "NFT not registered");
        HeroRecord storage record = heroRecords[nftContract][tokenId];
        require(record.isActive, "Hero record not found");
        
        // 查找技能
        bool found = false;
        for (uint i = 0; i < record.skills.length; i++) {
            if (keccak256(bytes(record.skills[i])) == keccak256(bytes(skillName))) {
                record.skillLevels[i] = newLevel;
                found = true;
                break;
            }
        }
        
        // 如果是新技能，添加到列表
        if (!found) {
            record.skills.push(skillName);
            record.skillLevels.push(newLevel);
        }
        
        emit SkillLevelUp(nftContract, tokenId, skillName, newLevel);
    }

    /**
     * @dev 升级英雄
     */
    function levelUp(
        address nftContract,
        uint256 tokenId,
        uint256 newLevel,
        uint256 newExperience
    ) external onlyOwner {
        require(isRegistered[nftContract], "NFT not registered");
        HeroRecord storage record = heroRecords[nftContract][tokenId];
        require(record.isActive, "Hero record not found");
        require(newLevel > record.level, "New level must be higher");
        
        record.level = newLevel;
        record.experience = newExperience;
        
        emit HeroLevelUp(nftContract, tokenId, newLevel);
    }
}
