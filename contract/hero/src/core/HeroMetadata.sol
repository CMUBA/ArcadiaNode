// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "../interfaces/IHeroMetadata.sol";

/**
 * @title HeroMetadata
 * @dev 存储和管理英雄相关的元数据，使用压缩存储方式
 */
contract HeroMetadata is 
    Initializable, 
    PausableUpgradeable, 
    AccessControlUpgradeable,
    UUPSUpgradeable,
    IHeroMetadata
{
    bytes32 public constant GAME_MANAGER = keccak256("GAME_MANAGER");
    bytes32 public constant DATA_CURATOR = keccak256("DATA_CURATOR");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");
    
    // 压缩存储的技能数据
    // heroId => seasonId => skillsData
    // 每个技能用 1 字节存储: 
    // - 高 4 位存储等级 (0-15)
    // - 低 4 位存储技能ID (0-15)
    mapping(uint256 => mapping(uint8 => uint8[5])) public compressedSkills;
    
    // 压缩存储的种族和职业数据
    // heroId => raceAndClass
    // 1 字节存储种族和职业:
    // - 高 4 位存储种族 (0-15)
    // - 低 4 位存储职业 (0-15)
    mapping(uint256 => uint8) public compressedRaceClass;
    
    // 压缩存储的属性数据
    // heroId => attributes
    // 每个属性用 2 字节存储 (0-65535)
    // [敏捷,攻击,生命,防御]
    mapping(uint256 => uint16[4]) public attributes;

    // 技能数据缓存
    mapping(uint8 => mapping(uint8 => mapping(uint8 => Skill))) private skills;
    
    // 种族数据缓存
    mapping(uint8 => RaceAttributes) private races;
    
    // 职业数据缓存
    mapping(uint8 => ClassAttributes) private classes;

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
        for (uint8 i = 0; i < 5; i++) {
            for (uint8 j = 0; j < 4; j++) {
                skills[i][j][_skillData[i * 4 + j]] = Skill(_skillData[i * 4 + j], _skillData[i * 4 + j + 5], _skillData[i * 4 + j + 10], _skillData[i * 4 + j + 15]);
            }
        }
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
        _setCompressedRaceClass(heroId, race, class);
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
        uint16 packed = uint16(agility) |
                       (uint16(attack) << 8) |
                       (uint16(health) << 16) |
                       (uint16(defense) << 16);
        attributes[heroId] = packed;
        emit AttributesUpdated(heroId, agility, attack, health, defense);
    }
    
    // 获取种族和职业
    function getRaceAndClass(uint256 heroId) 
        external 
        view 
        returns (uint8 race, uint8 class) 
    {
        uint8 data = compressedRaceClass[heroId];
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
        uint16 packed = attributes[heroId];
        agility = uint8(packed);
        attack = uint8(packed >> 8);
        health = uint8(packed >> 16);
        defense = uint8(packed >> 16);
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

    // 实现接口函数
    function getSkill(uint8 seasonId, uint8 skillId, uint8 level) external view returns (Skill memory) {
        return skills[seasonId][skillId][level];
    }

    function getRace(uint8 raceId) external view returns (RaceAttributes memory) {
        return races[raceId];
    }

    function getClass(uint8 classId) external view returns (ClassAttributes memory) {
        return classes[classId];
    }

    // 内部工具函数
    function _setCompressedSkill(
        uint256 heroId,
        uint8 seasonId,
        uint8 skillIndex,
        uint8 skillId,
        uint8 level
    ) internal {
        require(skillIndex < 5, "Invalid skill index");
        require(skillId < 16, "Skill ID too large");
        require(level < 16, "Level too large");
        
        // 压缩存储: level(4位) + skillId(4位)
        uint8 compressed = (level << 4) | skillId;
        compressedSkills[heroId][seasonId][skillIndex] = compressed;
    }

    function _getCompressedSkill(
        uint256 heroId,
        uint8 seasonId,
        uint8 skillIndex
    ) internal view returns (uint8 skillId, uint8 level) {
        uint8 compressed = compressedSkills[heroId][seasonId][skillIndex];
        level = compressed >> 4;    // 获取高4位
        skillId = compressed & 0xF;  // 获取低4位
    }

    function _setCompressedRaceClass(
        uint256 heroId,
        uint8 raceId,
        uint8 classId
    ) internal {
        require(raceId < 16, "Race ID too large");
        require(classId < 16, "Class ID too large");
        
        // 压缩存储: raceId(4位) + classId(4位)
        uint8 compressed = (raceId << 4) | classId;
        compressedRaceClass[heroId] = compressed;
    }

    function _getCompressedRaceClass(
        uint256 heroId
    ) internal view returns (uint8 raceId, uint8 classId) {
        uint8 compressed = compressedRaceClass[heroId];
        raceId = compressed >> 4;    // 获取高4位
        classId = compressed & 0xF;   // 获取低4位
    }
} 