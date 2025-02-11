// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IHeroNFT.sol";

/**
 * @title HeroNFT
 * @dev 英雄NFT合约,实现ERC721标准
 */
contract HeroNFT is 
    ERC721,
    Ownable,
    IHeroNFT 
{
    // 状态变量
    mapping(uint256 => PriceConfig) public priceConfigs;
    uint256 public defaultNativePrice;
    IERC20 public defaultPaymentToken;
    uint256 public defaultTokenPrice;
    string public constant VERSION = "1.0.1";

    // 重入锁
    bool private _locked;
    
    // 重入锁修饰器
    modifier nonReentrant() {
        require(!_locked, "ReentrancyGuard: reentrant call");
        _locked = true;
        _;
        _locked = false;
    }

    constructor(
        address defaultToken,
        uint256 nativePrice,
        uint256 tokenPrice
    ) ERC721("Hero NFT", "HERO") Ownable() {
        defaultPaymentToken = IERC20(defaultToken);
        defaultNativePrice = nativePrice;
        defaultTokenPrice = tokenPrice;
        _locked = false;
    }

    function mint(address to, uint256 tokenId) external payable override nonReentrant {
        uint256 price = priceConfigs[tokenId].isActive ? 
            priceConfigs[tokenId].price : defaultNativePrice;
            
        require(msg.value >= price, "Insufficient payment");
        
        _safeMint(to, tokenId);
        
        if(msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
        
        emit NFTMinted(to, tokenId, address(0), price, block.timestamp);
    }

    function mintWithToken(
        address to,
        uint256 tokenId,
        address paymentToken
    ) external override nonReentrant {
        require(paymentToken != address(0), "Invalid payment token");
        
        PriceConfig memory config = priceConfigs[tokenId];
        uint256 price;
        IERC20 token;
        
        if(config.isActive) {
            require(paymentToken == config.tokenAddress, "Wrong payment token");
            price = config.price;
            token = IERC20(config.tokenAddress);
        } else {
            require(paymentToken == address(defaultPaymentToken), "Wrong payment token");
            price = defaultTokenPrice;
            token = defaultPaymentToken;
        }
        
        require(token.transferFrom(msg.sender, address(this), price), "Transfer failed");
        
        _safeMint(to, tokenId);
        
        emit NFTMinted(to, tokenId, paymentToken, price, block.timestamp);
    }

    function mintBatch(
        address to,
        uint256[] calldata tokenIds
    ) external payable override nonReentrant {
        uint256 totalPrice = 0;
        
        for(uint256 i = 0; i < tokenIds.length; i++) {
            uint256 price = priceConfigs[tokenIds[i]].isActive ? 
                priceConfigs[tokenIds[i]].price : defaultNativePrice;
            totalPrice += price;
        }
        
        require(msg.value >= totalPrice, "Insufficient payment");
        
        for(uint256 i = 0; i < tokenIds.length; i++) {
            _safeMint(to, tokenIds[i]);
        }
        
        if(msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit NFTMinted(to, tokenIds[0], address(0), totalPrice, block.timestamp);
    }

    function mintBatchWithToken(
        address to,
        uint256[] calldata tokenIds,
        address paymentToken
    ) external override nonReentrant {
        require(paymentToken != address(0), "Invalid payment token");
        
        uint256 totalPrice = 0;
        IERC20 token = IERC20(paymentToken);
        
        for(uint256 i = 0; i < tokenIds.length; i++) {
            PriceConfig memory config = priceConfigs[tokenIds[i]];
            if(config.isActive) {
                require(paymentToken == config.tokenAddress, "Wrong payment token");
                totalPrice += config.price;
            } else {
                require(paymentToken == address(defaultPaymentToken), "Wrong payment token");
                totalPrice += defaultTokenPrice;
            }
        }
        
        require(token.transferFrom(msg.sender, address(this), totalPrice), "Transfer failed");
        
        for(uint256 i = 0; i < tokenIds.length; i++) {
            _safeMint(to, tokenIds[i]);
        }
        
        emit NFTMinted(to, tokenIds[0], paymentToken, totalPrice, block.timestamp);
    }

    function setPriceConfig(
        uint256 tokenId,
        address tokenAddress,
        uint256 price
    ) external override onlyOwner {
        priceConfigs[tokenId] = PriceConfig({
            tokenAddress: tokenAddress,
            price: price,
            isActive: true
        });
        
        emit PriceConfigUpdated(tokenId, tokenAddress, price, block.timestamp);
    }

    function getPriceConfig(
        uint256 tokenId
    ) external view override returns (PriceConfig memory) {
        return priceConfigs[tokenId];
    }

    function setDefaultPrices(
        uint256 nativePrice,
        uint256 tokenPrice
    ) external override onlyOwner {
        defaultNativePrice = nativePrice;
        defaultTokenPrice = tokenPrice;
    }

    function setDefaultPaymentToken(address token) external override onlyOwner {
        defaultPaymentToken = IERC20(token);
    }

    function getDefaultNativePrice() external view override returns (uint256) {
        return defaultNativePrice;
    }

    function getDefaultTokenPrice() external view override returns (uint256) {
        return defaultTokenPrice;
    }

    function getDefaultPaymentToken() external view override returns (address) {
        return address(defaultPaymentToken);
    }

    function burn(uint256 tokenId) external override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Not approved");
        _burn(tokenId);
    }

    function exists(uint256 tokenId) external view override returns (bool) {
        return _exists(tokenId);
    }

    function isApprovedForToken(
        address operator,
        uint256 tokenId
    ) external view override returns (bool) {
        return _isApprovedOrOwner(operator, tokenId);
    }

    function getAcceptedTokens(uint256 tokenId) external view returns (address[] memory) {
        address[] memory tokens = new address[](2);
        tokens[0] = address(0);  // Native token (ETH)
        
        if (priceConfigs[tokenId].isActive) {
            tokens[1] = priceConfigs[tokenId].tokenAddress;
        } else {
            tokens[1] = address(defaultPaymentToken);
        }
        
        return tokens;
    }
}