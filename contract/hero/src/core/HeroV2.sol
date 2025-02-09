// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract HeroV2 is Initializable, OwnableUpgradeable {
    // 状态变量
    address public officialNFT;                    // 官方NFT合约地址
    mapping(address => bool) public isRegistered;  // NFT注册状态
    address[] private registeredNFTs;              // 已注册的NFT列表
    string public VERSION;                         // 版本号

    // 事件
    event NFTRegistered(address indexed nftContract, bool isOfficial);
    event NFTUnregistered(address indexed nftContract);

    function initialize() public reinitializer(2) {
        __Ownable_init();
        VERSION = "2.0.0";
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
}
