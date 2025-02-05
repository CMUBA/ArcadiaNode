// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/IHeroCore.sol";
import "../interfaces/IHeroNFT.sol";

/**
 * @title Hero
 * @dev 英雄核心合约,实现数据压缩和签名验证
 */
contract Hero is 
    Initializable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    IHeroCore 
{
    using ECDSA for bytes32;

    // 状态变量
    IHeroNFT public heroNFT;
    mapping(uint256 => HeroData) private _heroes;
    mapping(address => bool) public registeredNodes;
    
    // 常量
    uint8 private constant MAX_LEVEL = 100;
    uint32 private constant MAX_EXP = 1000000;
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address _heroNFT) public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        heroNFT = IHeroNFT(_heroNFT);
        
        // 确保 Hero 合约是 NFT 合约的所有者
        OwnableUpgradeable(_heroNFT).transferOwnership(address(this));
    }

    function createHero(
        uint256 userId,
        string calldata name,
        uint8 race,
        uint8 class
    ) external override returns (uint256) {
        uint256 heroId = uint256(keccak256(abi.encodePacked(userId, block.timestamp, name)));
        require(!heroNFT.exists(heroId), "Hero: ID already exists");

        // 创建英雄数据
        HeroData memory newHero = HeroData({
            id: heroId,
            level: 1,
            exp: 0,
            createTime: uint32(block.timestamp),
            lastSaveTime: uint32(block.timestamp),
            signature: ""
        });

        _heroes[heroId] = newHero;
        heroNFT.mint(msg.sender, heroId);

        emit HeroCreated(userId, heroId, name, race, class);
        return heroId;
    }

    function loadHero(uint256 heroId) external view override returns (HeroData memory) {
        require(heroNFT.exists(heroId), "Hero: Hero does not exist");
        require(heroNFT.ownerOf(heroId) == msg.sender, "Hero: Not the owner");
        
        return _heroes[heroId];
    }

    function saveHero(
        uint256 heroId,
        HeroData calldata data,
        bytes calldata nodeSignature,
        bytes calldata clientSignature
    ) external override {
        require(heroNFT.exists(heroId), "Hero: Hero does not exist");
        require(heroNFT.ownerOf(heroId) == msg.sender, "Hero: Not the owner");
        require(data.level <= MAX_LEVEL, "Hero: Level exceeds maximum");
        require(data.exp <= MAX_EXP, "Hero: Experience exceeds maximum");
        
        // 验证签名
        require(
            verifyNodeSignature(heroId, data, nodeSignature),
            "Hero: Invalid node signature"
        );
        require(
            verifyClientSignature(heroId, data, clientSignature),
            "Hero: Invalid client signature"
        );

        _heroes[heroId] = data;
        emit HeroSaved(heroId, uint32(block.timestamp));
    }

    function verifyNodeSignature(
        uint256 heroId,
        HeroData calldata data,
        bytes calldata signature
    ) public view override returns (bool) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                heroId,
                data.level,
                data.exp,
                data.createTime,
                data.lastSaveTime
            )
        );
        address signer = messageHash.toEthSignedMessageHash().recover(signature);
        return registeredNodes[signer];
    }

    function verifyClientSignature(
        uint256 heroId,
        HeroData calldata data,
        bytes calldata signature
    ) public view override returns (bool) {
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                heroId,
                data.level,
                data.exp,
                data.createTime,
                data.lastSaveTime
            )
        );
        address signer = messageHash.toEthSignedMessageHash().recover(signature);
        return signer == heroNFT.ownerOf(heroId);
    }

    // 管理功能
    function registerNode(address node) external onlyOwner {
        registeredNodes[node] = true;
    }

    function unregisterNode(address node) external onlyOwner {
        registeredNodes[node] = false;
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 