// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IHeroCore {
    // 英雄数据结构
    struct HeroData {
        uint256 id;           // 英雄ID
        uint8 level;         // 等级
        uint32 exp;          // 经验值
        uint32 createTime;   // 创建时间
        uint32 lastSaveTime; // 最后保存时间
        bytes signature;     // 最后一次保存的签名
    }

    /**
     * @dev 创建新英雄
     * @param userId 用户ID
     * @param name 英雄名称
     * @param race 种族 (0-4)
     * @param class 职业 (0-4)
     * @notice 调用者必须拥有对应的NFT才能创建英雄
     * @return uint256 新英雄的ID
     */
    function createHero(
        uint256 userId,
        string calldata name,
        uint8 race,
        uint8 class
    ) external returns (uint256);

    /**
     * @dev 加载英雄数据
     * @param heroId 英雄ID
     * @return HeroData 英雄数据
     */
    function loadHero(uint256 heroId) external view returns (HeroData memory);

    /**
     * @dev 保存英雄数据
     * @param heroId 英雄ID
     * @param data 英雄数据
     * @param nodeSignature 节点签名
     * @param clientSignature 客户端签名
     */
    function saveHero(
        uint256 heroId,
        HeroData calldata data,
        bytes calldata nodeSignature,
        bytes calldata clientSignature
    ) external;

    /**
     * @dev 验证节点签名
     * @param heroId 英雄ID
     * @param data 英雄数据
     * @param signature 签名
     * @return bool 签名是否有效
     */
    function verifyNodeSignature(
        uint256 heroId,
        HeroData calldata data,
        bytes calldata signature
    ) external view returns (bool);

    /**
     * @dev 验证客户端签名
     * @param heroId 英雄ID
     * @param data 英雄数据
     * @param signature 签名
     * @return bool 签名是否有效
     */
    function verifyClientSignature(
        uint256 heroId,
        HeroData calldata data,
        bytes calldata signature
    ) external view returns (bool);

    // 事件
    event HeroCreated(uint256 indexed userId, uint256 indexed heroId, string name, uint8 race, uint8 class);
    event HeroSaved(uint256 indexed heroId, uint32 timestamp);
    event HeroLoaded(uint256 indexed heroId, uint32 timestamp);
} 