const heroMetadataAbi = [
    {
        "inputs": [
            {
                "internalType": "uint8",
                "name": "raceId",
                "type": "uint8"
            }
        ],
        "name": "getRace",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint8[6]",
                        "name": "baseAttributes",
                        "type": "uint8[6]"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    }
                ],
                "internalType": "struct RaceAttributes",
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
                "internalType": "uint8",
                "name": "classId",
                "type": "uint8"
            }
        ],
        "name": "getClass",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint8[6]",
                        "name": "baseAttributes",
                        "type": "uint8[6]"
                    },
                    {
                        "internalType": "uint8[6]",
                        "name": "growthRates",
                        "type": "uint8[6]"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    }
                ],
                "internalType": "struct ClassAttributes",
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
        "name": "getSkill",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint8",
                        "name": "level",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint32",
                        "name": "points",
                        "type": "uint32"
                    }
                ],
                "internalType": "struct SkillAttributes",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]; 