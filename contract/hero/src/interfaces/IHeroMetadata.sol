// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IHeroMetadata {
    // 枚举定义
    enum Season { Spring, Summer, Autumn, Winter }
    enum Race { Human, Elf, Dwarf, Orc, Undead }
    enum Class { Warrior, Mage, Archer, Rogue, Priest }
    enum Attribute { Agility, Attack, Health, Defense }

    // 结构体定义
    struct Skill {
        string name;        // 技能名称
        uint8 level;       // 技能等级
        uint16 points;     // 所需技能点
        Season season;     // 所属季节
        bool isActive;     // 是否激活
    }

    struct RaceAttributes {
        uint16[4] baseAttributes;  // 基础属性值 [敏捷,攻击,生命,防御]
        string description;        // 种族描述
        bool isActive;            // 是否激活
    }

    struct ClassAttributes {
        uint16[4] baseAttributes;  // 基础属性值 [敏捷,攻击,生命,防御]
        uint16[4] growthRates;     // 属性成长率 [敏捷,攻击,生命,防御]
        string description;        // 职业描述
        bool isActive;            // 是否激活
    }

    // 事件定义
    event SkillUpdated(uint8 seasonId, uint8 skillId, uint8 level, string name, uint16 points);
    event RaceUpdated(uint8 raceId, uint16[4] baseAttributes, string description);
    event ClassUpdated(uint8 classId, uint16[4] baseAttributes, uint16[4] growthRates, string description);

    // 函数定义
    function getSkill(uint8 seasonId, uint8 skillId, uint8 level) external view returns (Skill memory);
    function getRace(uint8 raceId) external view returns (RaceAttributes memory);
    function getClass(uint8 classId) external view returns (ClassAttributes memory);
} 