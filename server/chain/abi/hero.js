export const heroAbi = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "nftContract",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "verifyNFTOwnership",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "nftContract",
                "type": "address"
            },
            {
                "internalType": "bool",
                "name": "isOfficial",
                "type": "bool"
            }
        ],
        "name": "registerNFT",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "nftContract",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "enum HeroV6.Race",
                "name": "race",
                "type": "uint8"
            },
            {
                "internalType": "enum HeroV6.Gender",
                "name": "gender",
                "type": "uint8"
            }
        ],
        "name": "createHero",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "nftContract",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "getHeroInfo",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "enum HeroV6.Race",
                        "name": "race",
                        "type": "uint8"
                    },
                    {
                        "internalType": "enum HeroV6.Gender",
                        "name": "gender",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "level",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "energy",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "dailyPoints",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct HeroV6.HeroInfo",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "nftContract",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "enum HeroV6.Race",
                        "name": "race",
                        "type": "uint8"
                    },
                    {
                        "internalType": "enum HeroV6.Gender",
                        "name": "gender",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint256",
                        "name": "level",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "energy",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "dailyPoints",
                        "type": "uint256"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint8[]",
                                "name": "skillLevels",
                                "type": "uint8[]"
                            }
                        ],
                        "internalType": "struct HeroV6.SeasonSkills[4]",
                        "name": "seasonSkills",
                        "type": "tuple[4]"
                    },
                    {
                        "components": [
                            {
                                "internalType": "uint8",
                                "name": "slot",
                                "type": "uint8"
                            },
                            {
                                "internalType": "address",
                                "name": "equipContract",
                                "type": "address"
                            },
                            {
                                "internalType": "uint256",
                                "name": "equipTokenId",
                                "type": "uint256"
                            }
                        ],
                        "internalType": "struct HeroV6.Equipment[]",
                        "name": "equipment",
                        "type": "tuple[]"
                    }
                ],
                "internalType": "struct HeroV6.SaveHeroFullDataParams",
                "name": "params",
                "type": "tuple"
            }
        ],
        "name": "saveHeroFullData",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getRegisteredNFTs",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalHeroes",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "VERSION",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]; 