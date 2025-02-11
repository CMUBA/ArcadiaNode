export const heroAbi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "heroNFT",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "heroMetadata",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "raceId",
                "type": "uint8"
            },
            {
                "internalType": "uint8",
                "name": "classId",
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
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "getHero",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint8",
                        "name": "raceId",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "classId",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "level",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint16[4]",
                        "name": "attributes",
                        "type": "uint16[4]"
                    },
                    {
                        "internalType": "uint16",
                        "name": "experience",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "energy",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "lastEnergyUpdateTime",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "skillPoints",
                        "type": "uint16"
                    },
                    {
                        "internalType": "uint16",
                        "name": "attributePoints",
                        "type": "uint16"
                    }
                ],
                "internalType": "struct IHero.Hero",
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
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "seasonId",
                "type": "uint8"
            },
            {
                "internalType": "uint8",
                "name": "skillId",
                "type": "uint8"
            },
            {
                "internalType": "uint8",
                "name": "level",
                "type": "uint8"
            }
        ],
        "name": "setSkill",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "seasonId",
                "type": "uint8"
            },
            {
                "internalType": "uint8",
                "name": "skillId",
                "type": "uint8"
            }
        ],
        "name": "getSkill",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "attributeId",
                "type": "uint8"
            },
            {
                "internalType": "uint16",
                "name": "value",
                "type": "uint16"
            }
        ],
        "name": "setAttribute",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "uint8",
                "name": "attributeId",
                "type": "uint8"
            }
        ],
        "name": "getAttribute",
        "outputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "uint16",
                "name": "experience",
                "type": "uint16"
            }
        ],
        "name": "addExperience",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "getExperience",
        "outputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "getLevel",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "getEnergy",
        "outputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            },
            {
                "internalType": "uint16",
                "name": "energy",
                "type": "uint16"
            }
        ],
        "name": "consumeEnergy",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "getSkillPoints",
        "outputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256"
            }
        ],
        "name": "getAttributePoints",
        "outputs": [
            {
                "internalType": "uint16",
                "name": "",
                "type": "uint16"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]; 