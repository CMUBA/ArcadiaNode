// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "../interfaces/IHeroNFT.sol";

/**
 * @title HeroNFT
 * @dev 英雄NFT合约,实现ERC721标准
 */
contract HeroNFT is 
    Initializable,
    ERC721Upgradeable,
    OwnableUpgradeable,
    UUPSUpgradeable,
    IHeroNFT 
{
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Ownable_init();
        __ERC721_init("Hero NFT", "HERO");
        __UUPSUpgradeable_init();
    }

    function mint(address to, uint256 tokenId) external override onlyOwner {
        _safeMint(to, tokenId);
    }

    function mintBatch(address to, uint256[] calldata tokenIds) external override onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _safeMint(to, tokenIds[i]);
        }
    }

    function burn(uint256 tokenId) external override {
        require(_isApprovedOrOwner(msg.sender, tokenId), "HeroNFT: caller is not token owner or approved");
        _burn(tokenId);
    }

    function exists(uint256 tokenId) external view override returns (bool) {
        return _exists(tokenId);
    }

    function isApprovedForToken(address operator, uint256 tokenId) external view override returns (bool) {
        return _isApprovedOrOwner(operator, tokenId);
    }

    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}
} 