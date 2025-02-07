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
                        "internalType": "uint16[4]",
                        "name": "baseAttributes",
                        "type": "uint16[4]"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "isActive",
                        "type": "bool"
                    }
                ],
                "internalType": "struct IHeroMetadata.Race",
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
                        "internalType": "uint16[4]",
                        "name": "baseAttributes",
                        "type": "uint16[4]"
                    },
                    {
                        "internalType": "uint16[4]",
                        "name": "growthRates",
                        "type": "uint16[4]"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "bool",
                        "name": "isActive",
                        "type": "bool"
                    }
                ],
                "internalType": "struct IHeroMetadata.Class",
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
                        "internalType": "uint16",
                        "name": "points",
                        "type": "uint16"
                    },
                    {
                        "internalType": "bool",
                        "name": "isActive",
                        "type": "bool"
                    }
                ],
                "internalType": "struct IHeroMetadata.Skill",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

export { heroMetadataAbi as default };