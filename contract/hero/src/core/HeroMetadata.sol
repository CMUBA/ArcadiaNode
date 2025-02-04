// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

/**
 * @title HeroMetadata
 * @dev 存储和管理英雄元数据的合约
 * 包括：技能、种族、职业、属性等数据
 */
contract HeroMetadata is 
    Initializable, 
    PausableUpgradeable, 
    AccessControlUpgradeable,
    UUPSUpgradeable 
{
    bytes32 public constant GAME_MANAGER = keccak256("GAME_MANAGER");
    bytes32 public constant DATA_CURATOR = keccak256("DATA_CURATOR");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    // 技能数据压缩存储: heroId => [4个天赋x5个技能]
    mapping(uint256 => uint8[20]) public skillData;
    
    // 种族和职业使用位图存储: heroId => (race << 4 | class)
    mapping(uint256 => uint8) public raceAndClass;
    
    // 属性数据压缩存储: heroId => (agility | attack << 8 | health << 16 | defense << 24)
    mapping(uint256 => uint32) public attributes;
    
    // 每日限制数据
    struct DailyLimit {
        uint8 energy;      // 默认100
        uint16 maxPoints;  // 默认1000
        uint8 playCount;   // 默认3次
        uint32 lastUpdate; // 上次更新时间
    }
    mapping(uint256 => DailyLimit) public dailyLimits;
    
    // NFT合约白名单
    mapping(address => bool) public allowedNFTs;
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();
        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(GAME_MANAGER, msg.sender);
        _setupRole(DATA_CURATOR, msg.sender);
        _setupRole(UPGRADER_ROLE, msg.sender);
    }
    
    // 设置技能数据
    function setSkillData(uint256 heroId, uint8[20] calldata _skillData) 
        external 
        onlyRole(GAME_MANAGER)
        whenNotPaused 
    {
        skillData[heroId] = _skillData;
        emit SkillDataUpdated(heroId, _skillData);
    }
    
    // 设置种族和职业
    function setRaceAndClass(
        uint256 heroId, 
        uint8 race, 
        uint8 class
    ) 
        external 
        onlyRole(GAME_MANAGER)
        whenNotPaused 
    {
        require(race < 16 && class < 16, "Invalid race or class");
        raceAndClass[heroId] = (race << 4) | class;
        emit RaceAndClassUpdated(heroId, race, class);
    }
    
    // 设置属性
    function setAttributes(
        uint256 heroId,
        uint8 agility,
        uint8 attack,
        uint8 health,
        uint8 defense
    )
        external
        onlyRole(GAME_MANAGER)
        whenNotPaused
    {
        uint32 packed = uint32(agility) |
                       (uint32(attack) << 8) |
                       (uint32(health) << 16) |
                       (uint32(defense) << 24);
        attributes[heroId] = packed;
        emit AttributesUpdated(heroId, agility, attack, health, defense);
    }
    
    // 获取种族和职业
    function getRaceAndClass(uint256 heroId) 
        external 
        view 
        returns (uint8 race, uint8 class) 
    {
        uint8 data = raceAndClass[heroId];
        race = data >> 4;
        class = data & 0x0F;
    }
    
    // 获取属性
    function getAttributes(uint256 heroId)
        external
        view
        returns (
            uint8 agility,
            uint8 attack,
            uint8 health,
            uint8 defense
        )
    {
        uint32 packed = attributes[heroId];
        agility = uint8(packed);
        attack = uint8(packed >> 8);
        health = uint8(packed >> 16);
        defense = uint8(packed >> 24);
    }
    
    // 管理NFT白名单
    function setNFTAllowed(address nft, bool allowed) 
        external 
        onlyRole(DATA_CURATOR) 
    {
        allowedNFTs[nft] = allowed;
        emit NFTAllowedUpdated(nft, allowed);
    }
    
    // 紧急暂停
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }
    
    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    // 升级相关
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(UPGRADER_ROLE)
    {}

    // Events
    event SkillDataUpdated(uint256 indexed heroId, uint8[20] skillData);
    event RaceAndClassUpdated(uint256 indexed heroId, uint8 race, uint8 class);
    event AttributesUpdated(
        uint256 indexed heroId,
        uint8 agility,
        uint8 attack,
        uint8 health,
        uint8 defense
    );
    event NFTAllowedUpdated(address indexed nft, bool allowed);
} 