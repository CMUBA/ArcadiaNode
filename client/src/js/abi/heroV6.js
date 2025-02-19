export const heroV6Abi = [
    {
        "type": "constructor",
        "inputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "ENERGY_RECOVERY_RATE",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "MAX_DAILY_ENERGY",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "MAX_DAILY_POINTS",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "VERSION",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "string",
                "internalType": "string"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "addDailyPoints",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "consumeEnergy",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "amount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "createHero",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "name",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "race",
                "type": "uint8",
                "internalType": "enum HeroV6.Race"
            },
            {
                "name": "gender",
                "type": "uint8",
                "internalType": "enum HeroV6.Gender"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getHeroEquipment",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple[]",
                "internalType": "struct HeroV6.Equipment[]",
                "components": [
                    {
                        "name": "contractAddress",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "tokenId",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "slot",
                        "type": "uint8",
                        "internalType": "uint8"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getHeroInfo",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "name",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "race",
                "type": "uint8",
                "internalType": "enum HeroV6.Race"
            },
            {
                "name": "gender",
                "type": "uint8",
                "internalType": "enum HeroV6.Gender"
            },
            {
                "name": "level",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "energy",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "dailyPoints",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getHeroSkills",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "season",
                "type": "uint8",
                "internalType": "enum HeroV6.Season"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint8[5]",
                "internalType": "uint8[5]"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getRegisteredNFTs",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address[]",
                "internalType": "address[]"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "heroCount",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "heroes",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "name",
                "type": "string",
                "internalType": "string"
            },
            {
                "name": "race",
                "type": "uint8",
                "internalType": "enum HeroV6.Race"
            },
            {
                "name": "gender",
                "type": "uint8",
                "internalType": "enum HeroV6.Gender"
            },
            {
                "name": "level",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "energy",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "lastEnergyUpdateTime",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "dailyPoints",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "lastPointsUpdateTime",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "isRegistered",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "loadHero",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "tuple",
                "internalType": "struct HeroV6.HeroFullData",
                "components": [
                    {
                        "name": "name",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "race",
                        "type": "uint8",
                        "internalType": "enum HeroV6.Race"
                    },
                    {
                        "name": "gender",
                        "type": "uint8",
                        "internalType": "enum HeroV6.Gender"
                    },
                    {
                        "name": "level",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "energy",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "dailyPoints",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "seasonSkills",
                        "type": "tuple[4]",
                        "internalType": "struct HeroV6.SeasonSkills[4]",
                        "components": [
                            {
                                "name": "skillLevels",
                                "type": "uint8[5]",
                                "internalType": "uint8[5]"
                            }
                        ]
                    },
                    {
                        "name": "equipment",
                        "type": "tuple[]",
                        "internalType": "struct HeroV6.Equipment[]",
                        "components": [
                            {
                                "name": "contractAddress",
                                "type": "address",
                                "internalType": "address"
                            },
                            {
                                "name": "tokenId",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "slot",
                                "type": "uint8",
                                "internalType": "uint8"
                            }
                        ]
                    },
                    {
                        "name": "lastEnergyUpdateTime",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "lastPointsUpdateTime",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "officialNFT",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "registerNFT",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "isOfficial",
                "type": "bool",
                "internalType": "bool"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "registeredNFTs",
        "inputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "renounceOwnership",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "saveHero",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "functionIndex",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "data",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "saveHeroFullData",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "params",
                "type": "tuple",
                "internalType": "struct HeroV6.SaveHeroFullDataParams",
                "components": [
                    {
                        "name": "name",
                        "type": "string",
                        "internalType": "string"
                    },
                    {
                        "name": "race",
                        "type": "uint8",
                        "internalType": "enum HeroV6.Race"
                    },
                    {
                        "name": "gender",
                        "type": "uint8",
                        "internalType": "enum HeroV6.Gender"
                    },
                    {
                        "name": "level",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "energy",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "dailyPoints",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "seasonSkills",
                        "type": "tuple[4]",
                        "internalType": "struct HeroV6.SeasonSkills[4]",
                        "components": [
                            {
                                "name": "skillLevels",
                                "type": "uint8[5]",
                                "internalType": "uint8[5]"
                            }
                        ]
                    },
                    {
                        "name": "equipment",
                        "type": "tuple[]",
                        "internalType": "struct HeroV6.Equipment[]",
                        "components": [
                            {
                                "name": "contractAddress",
                                "type": "address",
                                "internalType": "address"
                            },
                            {
                                "name": "tokenId",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "slot",
                                "type": "uint8",
                                "internalType": "uint8"
                            }
                        ]
                    }
                ]
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "totalHeroCount",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "transferOwnership",
        "inputs": [
            {
                "name": "newOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "updateDailyStats",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "updateEquipment",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "slot",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "equipContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "equipTokenId",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "updateSkill",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "season",
                "type": "uint8",
                "internalType": "enum HeroV6.Season"
            },
            {
                "name": "skillIndex",
                "type": "uint8",
                "internalType": "uint8"
            },
            {
                "name": "level",
                "type": "uint8",
                "internalType": "uint8"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "DailyUpdate",
        "inputs": [
            {
                "name": "updatedHeroes",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "gasUsed",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "HeroCreated",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "name",
                "type": "string",
                "indexed": false,
                "internalType": "string"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "HeroEnergyUpdated",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "newEnergy",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "HeroEquipmentUpdated",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "slot",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            },
            {
                "name": "equipContract",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "equipTokenId",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "HeroPointsUpdated",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "newPoints",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "HeroSaved",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "functionIndex",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "HeroSkillUpdated",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "tokenId",
                "type": "uint256",
                "indexed": true,
                "internalType": "uint256"
            },
            {
                "name": "season",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            },
            {
                "name": "skillIndex",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            },
            {
                "name": "level",
                "type": "uint8",
                "indexed": false,
                "internalType": "uint8"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "NFTRegistered",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "isOfficial",
                "type": "bool",
                "indexed": false,
                "internalType": "bool"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "NFTUnregistered",
        "inputs": [
            {
                "name": "nftContract",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "OwnershipTransferred",
        "inputs": [
            {
                "name": "previousOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "newOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    }
]; 