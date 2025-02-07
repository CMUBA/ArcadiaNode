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
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
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
        "name": "loadHero",
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
                        "name": "race",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint8",
                        "name": "class",
                        "type": "uint8"
                    },
                    {
                        "internalType": "uint16[4]",
                        "name": "attributes",
                        "type": "uint16[4]"
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
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "heroId",
                "type": "uint256"
            }
        ],
        "name": "HeroCreated",
        "type": "event"
    }
];

export { heroAbi as default }; 