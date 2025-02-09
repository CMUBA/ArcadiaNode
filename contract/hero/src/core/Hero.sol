// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract Hero is Initializable, OwnableUpgradeable {
    // 状态变量
    address public officialNFT;                    // 官方NFT合约地址
    mapping(address => bool) public isRegistered;  // NFT注册状态
    address[] private registeredNFTs;              // 已注册的NFT列表

    // 事件
    event NFTRegistered(address indexed nftContract, bool isOfficial);
    event NFTUnregistered(address indexed nftContract);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init();
    }

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
        
        // 从数组中移除
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
     * @dev 获取官方NFT合约地址
     */
    function getOfficialNFT() external view returns (address) {
        require(officialNFT != address(0), "Official NFT not set");
        return officialNFT;
    }

    /**
     * @dev 获取所有已注册的NFT合约地址
     */
    function getRegisteredNFTs() external view returns (address[] memory) {
        return registeredNFTs;
    }

    // get Count
    function getRegisteredNFTCount() external view returns (uint256) {
        return registeredNFTs.length;
    }

    /**
     * @dev 检查NFT是否已注册
     */
    function isNFTRegistered(address nft) external view returns (bool) {
        return isRegistered[nft];
    }
}