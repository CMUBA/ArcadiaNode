// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

interface IHeroNFT is IERC721Upgradeable {
    /**
     * @dev 铸造新的英雄 NFT
     * @param to 接收者地址
     * @param tokenId NFT的ID
     */
    function mint(address to, uint256 tokenId) external;

    /**
     * @dev 批量铸造英雄 NFT
     * @param to 接收者地址
     * @param tokenIds NFT的ID数组
     */
    function mintBatch(address to, uint256[] calldata tokenIds) external;

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
} 