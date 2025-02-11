// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface IHeroNFT is IERC721 {
    // 价格配置结构
    struct PriceConfig {
        address tokenAddress;  // 支付代币地址
        uint256 price;        // 价格
        bool isActive;        // 是否激活
    }

    // 事件
    event NFTMinted(
        address indexed to,
        uint256 indexed tokenId,
        address paymentToken,
        uint256 price,
        uint256 timestamp
    );

    event PriceConfigUpdated(
        uint256 indexed tokenId,
        address tokenAddress,
        uint256 price,
        uint256 timestamp
    );

    /**
     * @dev 铸造新的英雄 NFT
     * @param to 接收者地址
     * @param tokenId NFT的ID
     */
    function mint(address to, uint256 tokenId) external payable;

    /**
     * @dev 批量铸造英雄 NFT
     * @param to 接收者地址
     * @param tokenIds NFT的ID数组
     */
    function mintBatch(address to, uint256[] calldata tokenIds) external payable;

    /**
     * @dev 销毁英雄 NFT
     * @param tokenId 要销毁的NFT的ID
     */
    function burn(uint256 tokenId) external;

    /**
     * @dev 检查NFT是否存在
     * @param tokenId NFT的ID
     * @return bool 是否存在
     */
    function exists(uint256 tokenId) external view returns (bool);

    /**
     * @dev 检查地址是否被授权使用NFT
     * @param operator 操作者地址
     * @param tokenId NFT的ID
     * @return bool 是否被授权
     */
    function isApprovedForToken(address operator, uint256 tokenId) external view returns (bool);

    // 价格管理函数
    function setPriceConfig(uint256 tokenId, address tokenAddress, uint256 price) external;
    function getPriceConfig(uint256 tokenId) external view returns (PriceConfig memory);
    function setDefaultPrices(uint256 nativePrice, uint256 tokenPrice) external;
    function setDefaultPaymentToken(address token) external;
    function getDefaultNativePrice() external view returns (uint256);
    function getDefaultTokenPrice() external view returns (uint256);
    function getDefaultPaymentToken() external view returns (address);

    // 新铸造函数
    function mintWithToken(address to, uint256 tokenId, address paymentToken) external;
    function mintBatchWithToken(address to, uint256[] calldata tokenIds, address paymentToken) external;
} 