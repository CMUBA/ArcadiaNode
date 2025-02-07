const heroAbi = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "uint8",
                "name": "race",
                "type": "uint8"
            },
            {
                "internalType": "uint8",
                "name": "class",
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
                "name": "heroId",
                "type": "uint256"
            }
        ],
        "name": "getHero",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "uint8",
                        "name": "race",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "class",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "level",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint32",
                        "name": "exp",
                        "type": "uint32"
                    }
                ],
                "internalType": "struct Hero",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]; 