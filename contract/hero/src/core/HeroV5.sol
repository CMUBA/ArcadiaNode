// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HeroV5 {
    // 状态变量
    address public owner;                          // 合约所有者
    address public officialNFT;                    // 官方NFT合约地址
    mapping(address => bool) public isRegistered;  // NFT注册状态
    address[] private registeredNFTs;              // 已注册的NFT列表
    string public constant VERSION = "5.0.0";      // 版本号

    // V5新增: 英雄计数
    mapping(address => uint256) public heroCount;  // 每个NFT合约的英雄数量
    uint256 public totalHeroCount;                 // 总英雄数量

    // 英雄属性枚举
    enum Race { Human, Elf, Dwarf, Orc, Undead }
    enum Gender { Male, Female }
    enum Season { Spring, Summer, Autumn, Winter }

    // 技能结构
    struct SeasonSkills {
        uint8[5] skillLevels;  // 每个季节有5个技能等级
    }

    // 英雄装备
    struct Equipment {
        address contractAddress;  // 装备NFT合约地址
        uint256 tokenId;         // 装备NFT的tokenId
        uint8 slot;              // 0: Weapon, 1: Armor, 2: Accessory
    }

    // 英雄数据结构
    struct HeroData {
        string name;             // 英雄名称
        Race race;              // 种族
        Gender gender;          // 性别
        uint256 level;          // 等级
        uint256 energy;         // 能量值
        mapping(Season => SeasonSkills) skills;  // 四季技能
        Equipment[] equipment;   // 装备列表
        uint256 lastEnergyUpdateTime;  // 上次能量更新时间
        uint256 dailyPoints;     // 每日积分
        uint256 lastPointsUpdateTime;  // 上次积分更新时间
    }

    // 常量
    uint256 public constant MAX_DAILY_ENERGY = 100;
    uint256 public constant MAX_DAILY_POINTS = 1000;
    uint256 public constant ENERGY_RECOVERY_RATE = 1 days;  // 每天恢复一次
    
    // 存储
    mapping(address => mapping(uint256 => HeroData)) private heroes;  // NFT合约地址 => tokenId => 英雄数据

    // 事件
    event NFTRegistered(address indexed nftContract, bool isOfficial);
    event NFTUnregistered(address indexed nftContract);
    event HeroCreated(address indexed nftContract, uint256 indexed tokenId, string name);
    event HeroSkillUpdated(address indexed nftContract, uint256 indexed tokenId, uint8 season, uint8 skillIndex, uint8 level);
    event HeroEquipmentUpdated(address indexed nftContract, uint256 indexed tokenId, uint8 slot, address equipContract, uint256 equipTokenId);
    event HeroEnergyUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 newEnergy);
    event HeroPointsUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 newPoints);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    modifier onlyOwner() {
        require(owner == msg.sender, "Caller is not the owner");
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    /**
     * @dev 注册NFT合约
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

    /**
     * @dev 创建英雄
     */
    function createHero(
        address nftContract,
        uint256 tokenId,
        string memory name,
        Race race,
        Gender gender
    ) external {
        require(isRegistered[nftContract], "NFT not registered");
        require(bytes(heroes[nftContract][tokenId].name).length == 0, "Hero already exists");
        
        HeroData storage hero = heroes[nftContract][tokenId];
        hero.name = name;
        hero.race = race;
        hero.gender = gender;
        hero.level = 1;
        hero.energy = MAX_DAILY_ENERGY;
        hero.lastEnergyUpdateTime = block.timestamp;
        hero.dailyPoints = 0;
        hero.lastPointsUpdateTime = block.timestamp;
        
        heroCount[nftContract]++;
        totalHeroCount++;
        
        emit HeroCreated(nftContract, tokenId, name);
    }

    /**
     * @dev 更新技能等级
     */
    function updateSkill(
        address nftContract,
        uint256 tokenId,
        Season season,
        uint8 skillIndex,
        uint8 level
    ) external onlyOwner {
        require(isRegistered[nftContract], "NFT not registered");
        require(skillIndex < 5, "Invalid skill index");
        require(level <= 100, "Invalid skill level");
        
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");
        
        hero.skills[season].skillLevels[skillIndex] = level;
        
        emit HeroSkillUpdated(nftContract, tokenId, uint8(season), skillIndex, level);
    }

    /**
     * @dev 更新装备
     */
    function updateEquipment(
        address nftContract,
        uint256 tokenId,
        uint8 slot,
        address equipContract,
        uint256 equipTokenId
    ) external onlyOwner {
        require(isRegistered[nftContract], "NFT not registered");
        require(slot <= 2, "Invalid equipment slot");
        
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");
        
        // 移除旧装备
        for (uint i = 0; i < hero.equipment.length; i++) {
            if (hero.equipment[i].slot == slot) {
                hero.equipment[i] = hero.equipment[hero.equipment.length - 1];
                hero.equipment.pop();
                break;
            }
        }
        
        // 添加新装备
        if (equipContract != address(0)) {
            hero.equipment.push(Equipment({
                contractAddress: equipContract,
                tokenId: equipTokenId,
                slot: slot
            }));
        }
        
        emit HeroEquipmentUpdated(nftContract, tokenId, slot, equipContract, equipTokenId);
    }

    /**
     * @dev 消耗能量
     */
    function consumeEnergy(
        address nftContract,
        uint256 tokenId,
        uint256 amount
    ) external onlyOwner {
        require(isRegistered[nftContract], "NFT not registered");
        
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");
        
        // 检查能量是否已恢复
        if (block.timestamp >= hero.lastEnergyUpdateTime + ENERGY_RECOVERY_RATE) {
            hero.energy = MAX_DAILY_ENERGY;
            hero.lastEnergyUpdateTime = block.timestamp - (block.timestamp % ENERGY_RECOVERY_RATE);
        }
        
        require(hero.energy >= amount, "Insufficient energy");
        hero.energy -= amount;
        
        emit HeroEnergyUpdated(nftContract, tokenId, hero.energy);
    }

    /**
     * @dev 增加每日积分
     */
    function addDailyPoints(
        address nftContract,
        uint256 tokenId,
        uint256 amount
    ) external onlyOwner {
        require(isRegistered[nftContract], "NFT not registered");
        
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");
        
        // 检查是否需要重置每日积分
        if (block.timestamp >= hero.lastPointsUpdateTime + 1 days) {
            hero.dailyPoints = 0;
            hero.lastPointsUpdateTime = block.timestamp - (block.timestamp % 1 days);
        }
        
        require(hero.dailyPoints + amount <= MAX_DAILY_POINTS, "Daily points limit exceeded");
        hero.dailyPoints += amount;
        
        emit HeroPointsUpdated(nftContract, tokenId, hero.dailyPoints);
    }

    /**
     * @dev 获取英雄信息
     */
    function getHeroInfo(address nftContract, uint256 tokenId) external view returns (
        string memory name,
        Race race,
        Gender gender,
        uint256 level,
        uint256 energy,
        uint256 dailyPoints
    ) {
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");
        
        return (
            hero.name,
            hero.race,
            hero.gender,
            hero.level,
            hero.energy,
            hero.dailyPoints
        );
    }

    /**
     * @dev 获取英雄技能
     */
    function getHeroSkills(
        address nftContract,
        uint256 tokenId,
        Season season
    ) external view returns (uint8[5] memory) {
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");
        
        return hero.skills[season].skillLevels;
    }

    /**
     * @dev 获取英雄装备
     */
    function getHeroEquipment(address nftContract, uint256 tokenId) external view returns (Equipment[] memory) {
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");
        
        return hero.equipment;
    }

    /**
     * @dev 获取已注册的NFT列表
     */
    function getRegisteredNFTs() external view returns (address[] memory) {
        return registeredNFTs;
    }
}