// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
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
    IHeroCore,
    PausableUpgradeable
{
    using ECDSA for bytes32;

    // 状态变量
    IHeroNFT public nftContract;
    mapping(address => bool) public registeredNodes;
    mapping(uint256 => HeroData) private _heroes;
    uint256 private _totalHeroes;
    mapping(address => uint256[]) private _ownerHeroes;
    
    // NFT合约管理
    address[] private _registeredNFTs;
    mapping(address => bool) private _isRegisteredNFT;
    
    // 常量
    uint8 private constant _MAX_LEVEL = 100;
    uint32 private constant _MAX_EXP = 1000000;
    
    // 事件
    event NFTContractUpdated(address indexed oldContract, address indexed newContract);
    event NodeRegistered(address indexed node);
    event NodeUnregistered(address indexed node);
    event NFTRegistered(address indexed nftContract);
    event NFTRegistrationFailed(address indexed nftContract, string reason);
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init();
        __UUPSUpgradeable_init();
        __Pausable_init();
    }

    // NFT 合约管理
    // NFT合约管理实现
    function addRegisteredNFT(address _nftContractAddr) external override onlyOwner {
        if (_nftContractAddr == address(0)) {
            emit NFTRegistrationFailed(_nftContractAddr, "Invalid NFT contract address");
            revert("Invalid NFT contract address");
        }
        if (_isRegisteredNFT[_nftContractAddr]) {
            emit NFTRegistrationFailed(_nftContractAddr, "NFT contract already registered");
            revert("NFT contract already registered");
        }
        
        _registeredNFTs.push(_nftContractAddr);
        _isRegisteredNFT[_nftContractAddr] = true;
        emit NFTRegistered(_nftContractAddr);
    }
    
    function removeRegisteredNFT(address _nftContractAddr) external override onlyOwner {
        require(_isRegisteredNFT[_nftContractAddr], "NFT contract not registered");
        
        // 从数组中移除
        for (uint i = 0; i < _registeredNFTs.length; i++) {
            if (_registeredNFTs[i] == _nftContractAddr) {
                _registeredNFTs[i] = _registeredNFTs[_registeredNFTs.length - 1];
                _registeredNFTs.pop();
                break;
            }
        }
        
        _isRegisteredNFT[_nftContractAddr] = false;
    }
    
    function getRegisteredNFTs() external view override returns (address[] memory) {
        return _registeredNFTs;
    }
    
    function isRegisteredNFT(address _nftContractAddr) external view override returns (bool) {
        return _isRegisteredNFT[_nftContractAddr];
    }

    function setNFTContract(address _nftContract) external onlyOwner {
        require(_nftContract != address(0), "Invalid NFT contract address");
        address oldContract = address(nftContract);
        nftContract = IHeroNFT(_nftContract);
        emit NFTContractUpdated(oldContract, _nftContract);
    }

    // 节点管理
    function registerNode(address node) external onlyOwner {
        require(node != address(0), "Invalid node address");
        registeredNodes[node] = true;
        emit NodeRegistered(node);
    }

    function unregisterNode(address node) external onlyOwner {
        registeredNodes[node] = false;
        emit NodeUnregistered(node);
    }

    // 英雄管理
    function createHero(
        uint256 userId,
        string calldata name,
        uint8 race,
        uint8 class
    ) external override returns (uint256) {
        require(address(nftContract) != address(0), "NFT contract not set");
        require(race < 5, "Invalid race");
        require(class < 5, "Invalid class");
        
        // 检查调用者是否拥有对应的 NFT
        uint256 tokenId = uint256(keccak256(abi.encodePacked(userId, name, race, class)));
        require(nftContract.exists(tokenId), "NFT does not exist");
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not NFT owner");

        // 创建英雄数据
        _heroes[tokenId] = HeroData({
            id: tokenId,
            level: 1,
            exp: 0,
            createTime: uint32(block.timestamp),
            lastSaveTime: uint32(block.timestamp),
            signature: ""
        });

        // 更新状态
        _totalHeroes++;
        _ownerHeroes[msg.sender].push(tokenId);
        
        emit HeroCreated(userId, tokenId, name, race, class);
        return tokenId;
    }

    // 新增read接口实现
    function getHeroCount() external view override returns (uint256) {
        return _totalHeroes;
    }

    function getHerosByOwner(address owner) external view override returns (uint256[] memory) {
        return _ownerHeroes[owner];
    }

    function getHeroStats(uint256 heroId) external view override returns (
        uint8 level,
        uint32 exp,
        uint32 createTime,
        uint32 lastSaveTime
    ) {
        HeroData memory hero = _heroes[heroId];
        require(hero.id != 0, "Hero does not exist");
        
        return (
            hero.level,
            hero.exp,
            hero.createTime,
            hero.lastSaveTime
        );
    }

    function loadHero(uint256 heroId) external view override returns (HeroData memory) {
        require(_heroes[heroId].id != 0, "Hero does not exist");
        require(nftContract.ownerOf(heroId) == msg.sender, "Not hero owner");
        return _heroes[heroId];
    }

    // Debug function
    function debug() external view returns (string memory) {
        return "Debug: Contract is working";
    }

    function saveHero(
        uint256 heroId,
        HeroData calldata data,
        bytes calldata nodeSignature,
        bytes calldata clientSignature
    ) external override whenNotPaused {
        require(_heroes[heroId].id != 0, "Hero does not exist");
        require(nftContract.ownerOf(heroId) == msg.sender, "Not hero owner");
        require(verifyNodeSignature(heroId, data, nodeSignature), "Invalid node signature");
        require(verifyClientSignature(heroId, data, clientSignature), "Invalid client signature");
        
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
        return signer == nftContract.ownerOf(heroId);
    }

    // 紧急暂停
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 