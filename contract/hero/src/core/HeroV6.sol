// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract HeroV6 is Ownable {
    // State variables
    address public officialNFT;                    
    mapping(address => bool) public isRegistered;  
    address[] public registeredNFTs;              
    string public constant VERSION = "6.0.0";      

    // Hero count tracking
    mapping(address => uint256) public heroCount;  
    uint256 public totalHeroCount;                 

    // Enums
    enum Race { Human, Elf, Dwarf, Orc, Undead }
    enum Gender { Male, Female }
    enum Season { Spring, Summer, Autumn, Winter }

    // Function indexes for saveHero
    uint8 private constant SAVE_BASIC_INFO = 0;
    uint8 private constant SAVE_SKILLS = 1;
    uint8 private constant SAVE_EQUIPMENT = 2;
    uint8 private constant SAVE_DAILY_POINTS = 3;
    uint8 private constant SAVE_ENERGY = 4;

    // Structs
    struct SeasonSkills {
        uint8[5] skillLevels;  
    }

    struct Equipment {
        address contractAddress;  
        uint256 tokenId;         
        uint8 slot;              
    }

    struct HeroData {
        string name;             
        Race race;              
        Gender gender;          
        uint256 level;          
        uint256 energy;         
        mapping(Season => SeasonSkills) skills;  
        Equipment[] equipment;   
        uint256 lastEnergyUpdateTime;  
        uint256 dailyPoints;     
        uint256 lastPointsUpdateTime;  
    }

    struct SaveBasicInfoParams {
        string name;
        Race race;
        Gender gender;
        uint256 level;
    }

    struct SaveSkillParams {
        Season season;
        uint8 skillIndex;
        uint8 level;
    }

    struct SaveEquipmentParams {
        uint8 slot;
        address equipContract;
        uint256 equipTokenId;
    }

    struct HeroFullData {
        string name;
        Race race;
        Gender gender;
        uint256 level;
        uint256 energy;
        uint256 dailyPoints;
        SeasonSkills[4] seasonSkills;
        Equipment[] equipment;
        uint256 lastEnergyUpdateTime;
        uint256 lastPointsUpdateTime;
    }

    struct SaveHeroFullDataParams {
        string name;
        Race race;
        Gender gender;
        uint256 level;
        uint256 energy;
        uint256 dailyPoints;
        SeasonSkills[4] seasonSkills;
        Equipment[] equipment;
    }

    // Constants
    uint256 public constant MAX_DAILY_ENERGY = 100;
    uint256 public constant MAX_DAILY_POINTS = 1000;
    uint256 public constant ENERGY_RECOVERY_RATE = 1 days;  

    // Storage
    mapping(address => mapping(uint256 => HeroData)) public heroes;  

    // Events
    event NFTRegistered(address indexed nftContract, bool isOfficial);
    event NFTUnregistered(address indexed nftContract);
    event HeroCreated(address indexed nftContract, uint256 indexed tokenId, string name);
    event HeroSkillUpdated(address indexed nftContract, uint256 indexed tokenId, uint8 season, uint8 skillIndex, uint8 level);
    event HeroEquipmentUpdated(address indexed nftContract, uint256 indexed tokenId, uint8 slot, address equipContract, uint256 equipTokenId);
    event HeroEnergyUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 newEnergy);
    event HeroPointsUpdated(address indexed nftContract, uint256 indexed tokenId, uint256 newPoints);
    event HeroSaved(address indexed nftContract, uint256 indexed tokenId, uint8 functionIndex);
    event DailyUpdate(uint256 updatedHeroes, uint256 gasUsed);

    constructor() Ownable() {}

    // Original V5 functions
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

    function createHero(
        address nftContract,
        uint256 tokenId,
        string memory name,
        Race race,
        Gender gender
    ) external {
        require(isRegistered[nftContract], "NFT not registered");
        require(bytes(heroes[nftContract][tokenId].name).length == 0, "Hero already exists");
        
        HeroData storage hero = heroes[nftContract][tokenId];
        hero.name = name;
        hero.race = race;
        hero.gender = gender;
        hero.level = 1;
        hero.energy = MAX_DAILY_ENERGY;
        hero.lastEnergyUpdateTime = block.timestamp;
        hero.dailyPoints = 0;
        hero.lastPointsUpdateTime = block.timestamp;
        
        heroCount[nftContract]++;
        totalHeroCount++;
        
        emit HeroCreated(nftContract, tokenId, name);
    }

    function updateSkill(
        address nftContract,
        uint256 tokenId,
        Season season,
        uint8 skillIndex,
        uint8 level
    ) public onlyOwner {
        require(isRegistered[nftContract], "NFT not registered");
        require(skillIndex < 5, "Invalid skill index");
        require(level <= 100, "Invalid skill level");
        
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");
        
        hero.skills[season].skillLevels[skillIndex] = level;
        
        emit HeroSkillUpdated(nftContract, tokenId, uint8(season), skillIndex, level);
    }

    function updateEquipment(
        address nftContract,
        uint256 tokenId,
        uint8 slot,
        address equipContract,
        uint256 equipTokenId
    ) public onlyOwner {
        require(isRegistered[nftContract], "NFT not registered");
        require(slot <= 2, "Invalid equipment slot");
        
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");
        
        // Remove old equipment
        for (uint i = 0; i < hero.equipment.length; i++) {
            if (hero.equipment[i].slot == slot) {
                hero.equipment[i] = hero.equipment[hero.equipment.length - 1];
                hero.equipment.pop();
                break;
            }
        }
        
        // Add new equipment
        if (equipContract != address(0)) {
            hero.equipment.push(Equipment({
                contractAddress: equipContract,
                tokenId: equipTokenId,
                slot: slot
            }));
        }
        
        emit HeroEquipmentUpdated(nftContract, tokenId, slot, equipContract, equipTokenId);
    }

    function consumeEnergy(
        address nftContract,
        uint256 tokenId,
        uint256 amount
    ) public onlyOwner {
        require(isRegistered[nftContract], "NFT not registered");
        
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");
        
        if (block.timestamp >= hero.lastEnergyUpdateTime + ENERGY_RECOVERY_RATE) {
            hero.energy = MAX_DAILY_ENERGY;
            hero.lastEnergyUpdateTime = block.timestamp - (block.timestamp % ENERGY_RECOVERY_RATE);
        }
        
        require(hero.energy >= amount, "Insufficient energy");
        hero.energy -= amount;
        
        emit HeroEnergyUpdated(nftContract, tokenId, hero.energy);
    }

    function addDailyPoints(
        address nftContract,
        uint256 tokenId,
        uint256 amount
    ) public onlyOwner {
        require(isRegistered[nftContract], "NFT not registered");
        
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");
        
        if (block.timestamp >= hero.lastPointsUpdateTime + 1 days) {
            hero.dailyPoints = 0;
            hero.lastPointsUpdateTime = block.timestamp - (block.timestamp % 1 days);
        }
        
        require(hero.dailyPoints + amount <= MAX_DAILY_POINTS, "Daily points limit exceeded");
        hero.dailyPoints += amount;
        
        emit HeroPointsUpdated(nftContract, tokenId, hero.dailyPoints);
    }

    // New V6 functions
    function saveHero(
        address nftContract,
        uint256 tokenId,
        uint8 functionIndex,
        bytes calldata data
    ) external onlyOwner {
        require(isRegistered[nftContract], "NFT not registered");
        require(bytes(heroes[nftContract][tokenId].name).length > 0, "Hero does not exist");

        if (functionIndex == SAVE_BASIC_INFO) {
            SaveBasicInfoParams memory params = abi.decode(data, (SaveBasicInfoParams));
            require(bytes(params.name).length <= 16, "Name too long");
            require(uint8(params.race) <= 4, "Invalid race");
            require(uint8(params.gender) <= 1, "Invalid gender");

            HeroData storage hero = heroes[nftContract][tokenId];
            hero.name = params.name;
            hero.race = params.race;
            hero.gender = params.gender;
            hero.level = params.level;
        }
        else if (functionIndex == SAVE_SKILLS) {
            SaveSkillParams memory params = abi.decode(data, (SaveSkillParams));
            updateSkill(nftContract, tokenId, params.season, params.skillIndex, params.level);
        }
        else if (functionIndex == SAVE_EQUIPMENT) {
            SaveEquipmentParams memory params = abi.decode(data, (SaveEquipmentParams));
            updateEquipment(nftContract, tokenId, params.slot, params.equipContract, params.equipTokenId);
        }
        else if (functionIndex == SAVE_DAILY_POINTS) {
            uint256 amount = abi.decode(data, (uint256));
            addDailyPoints(nftContract, tokenId, amount);
        }
        else if (functionIndex == SAVE_ENERGY) {
            uint256 amount = abi.decode(data, (uint256));
            consumeEnergy(nftContract, tokenId, amount);
        }
        else {
            revert("Invalid function index");
        }

        emit HeroSaved(nftContract, tokenId, functionIndex);
    }

    function loadHero(address nftContract, uint256 tokenId) 
        external 
        view 
        returns (HeroFullData memory) 
    {
        require(isRegistered[nftContract], "NFT not registered");
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");

        HeroFullData memory fullData;
        fullData.name = hero.name;
        fullData.race = hero.race;
        fullData.gender = hero.gender;
        fullData.level = hero.level;
        fullData.energy = hero.energy;
        fullData.dailyPoints = hero.dailyPoints;
        fullData.equipment = hero.equipment;
        fullData.lastEnergyUpdateTime = hero.lastEnergyUpdateTime;
        fullData.lastPointsUpdateTime = hero.lastPointsUpdateTime;

        // Load skills for all seasons
        for (uint8 i = 0; i < 4; i++) {
            Season season = Season(i);
            fullData.seasonSkills[i] = hero.skills[season];
        }

        return fullData;
    }

    function updateDailyStats() external onlyOwner {
        uint256 startGas = gasleft();
        uint256 updatedCount = 0;

        for (uint256 i = 0; i < registeredNFTs.length; i++) {
            address nftContract = registeredNFTs[i];
            uint256 count = heroCount[nftContract];
            
            for (uint256 tokenId = 1; tokenId <= count; tokenId++) {
                HeroData storage hero = heroes[nftContract][tokenId];
                if (bytes(hero.name).length == 0) continue;

                // Reset energy to max
                hero.energy = MAX_DAILY_ENERGY;
                hero.lastEnergyUpdateTime = block.timestamp;

                // Transfer and reset daily points
                if (hero.dailyPoints > 0) {
                    // TODO: Implement points transfer logic
                    hero.dailyPoints = 0;
                }
                hero.lastPointsUpdateTime = block.timestamp;

                updatedCount++;
            }
        }

        uint256 gasUsed = startGas - gasleft();
        emit DailyUpdate(updatedCount, gasUsed);
    }

    // View functions
    function getHeroInfo(address nftContract, uint256 tokenId) external view returns (
        string memory name,
        Race race,
        Gender gender,
        uint256 level,
        uint256 energy,
        uint256 dailyPoints
    ) {
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");
        
        return (
            hero.name,
            hero.race,
            hero.gender,
            hero.level,
            hero.energy,
            hero.dailyPoints
        );
    }

    function getHeroSkills(
        address nftContract,
        uint256 tokenId,
        Season season
    ) external view returns (uint8[5] memory) {
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");
        
        return hero.skills[season].skillLevels;
    }

    function getHeroEquipment(address nftContract, uint256 tokenId) external view returns (Equipment[] memory) {
        HeroData storage hero = heroes[nftContract][tokenId];
        require(bytes(hero.name).length > 0, "Hero does not exist");
        
        return hero.equipment;
    }

    function getRegisteredNFTs() external view returns (address[] memory) {
        return registeredNFTs;
    }

    function saveHeroFullData(
        address nftContract,
        uint256 tokenId,
        SaveHeroFullDataParams calldata params
    ) external onlyOwner {
        require(isRegistered[nftContract], "NFT not registered");
        require(bytes(heroes[nftContract][tokenId].name).length > 0, "Hero does not exist");
        require(bytes(params.name).length <= 16, "Name too long");
        require(uint8(params.race) <= 4, "Invalid race");
        require(uint8(params.gender) <= 1, "Invalid gender");
        require(params.energy <= MAX_DAILY_ENERGY, "Energy exceeds maximum");
        require(params.dailyPoints <= MAX_DAILY_POINTS, "Daily points exceed maximum");

        HeroData storage hero = heroes[nftContract][tokenId];
        
        // Update basic info
        hero.name = params.name;
        hero.race = params.race;
        hero.gender = params.gender;
        hero.level = params.level;
        hero.energy = params.energy;
        hero.dailyPoints = params.dailyPoints;
        hero.lastEnergyUpdateTime = block.timestamp;
        hero.lastPointsUpdateTime = block.timestamp;

        // Update skills for all seasons
        for (uint8 i = 0; i < 4; i++) {
            Season season = Season(i);
            for (uint8 j = 0; j < 5; j++) {
                require(params.seasonSkills[i].skillLevels[j] <= 100, "Skill level exceeds maximum");
                hero.skills[season].skillLevels[j] = params.seasonSkills[i].skillLevels[j];
            }
        }

        // Clear existing equipment
        while (hero.equipment.length > 0) {
            hero.equipment.pop();
        }

        // Add new equipment
        for (uint i = 0; i < params.equipment.length; i++) {
            require(params.equipment[i].slot <= 2, "Invalid equipment slot");
            hero.equipment.push(params.equipment[i]);
        }

        emit HeroSaved(nftContract, tokenId, 255); // Use 255 as special index for full data save
    }
} 