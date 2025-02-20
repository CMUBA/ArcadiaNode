import heroConfig from '../config/hero.js';
import { ethers } from 'ethers';

const api = {
    node: {
        getChallenge: () => fetch(`${heroConfig.test.SERVER_API_URL}/node/get-challenge`),
        queryNode: (address) => fetch(`${heroConfig.test.SERVER_API_URL}/node/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address })
        }),
        register: async (data) => {
            try {
                const response = await fetch(`${heroConfig.test.SERVER_API_URL}/node/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data),
                });

                console.log('Response:', response);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error: ${response.status} - ${errorText}`);
                }

                return response.json();
            } catch (error) {
                console.error('Registration error:', error);
                throw error;
            }
        },
        getENS: (address) => fetch(`${heroConfig.test.SERVER_API_URL}/node/ens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address })
        })
    },
    hero: {
        create: async (data, signer) => {
            try {
                // Create message for API authentication
                const message = `Create Hero: ${data.nftContract}-${data.tokenId}`;
                const signature = await signer.signMessage(message);
                const address = await signer.getAddress();

                // Create contract instance for transaction data
                const abi = [
                    "function createHero(address nftContract, uint256 tokenId, string memory name, uint8 race, uint8 gender) external returns (bool)"
                ];
                const heroContractAddress = heroConfig.ethereum.contracts.hero;
                if (!heroContractAddress) {
                    throw new Error('Hero contract address not configured');
                }
                const contract = new ethers.Contract(heroContractAddress, abi, signer);

                // Send transaction directly
                const tx = await contract.createHero(
                    data.nftContract,
                    ethers.getBigInt(data.tokenId),
                    data.name,
                    Number(data.race),
                    Number(data.gender || 0)
                );

                // Wait for transaction confirmation
                const receipt = await tx.wait();

                const response = await fetch(`${heroConfig.test.SERVER_API_URL}/hero/create`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'signature': signature,
                        'message': message,
                        'address': address
                    },
                    body: JSON.stringify({
                        ...data,
                        transactionHash: receipt.hash
                    })
                });

                console.log('Response:', response);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error: ${response.status} - ${errorText}`);
                }

                return response.json();
            } catch (error) {
                console.error('Create hero error:', error);
                throw error;
            }
        },
        load: async (nftContract, tokenId, signer) => {
            try {
                // Create message for API authentication
                const message = `Load Hero: ${nftContract}-${tokenId}`;
                const signature = await signer.signMessage(message);
                const address = await signer.getAddress();

                // First check if hero exists on-chain
                const abi = ["function getHeroInfo(address nftContract, uint256 tokenId) view returns (tuple(string name, uint8 race, uint8 gender, uint256 level, uint256 energy, uint256 dailyPoints))"];
                const heroContractAddress = heroConfig.ethereum.contracts.hero;
                const contract = new ethers.Contract(heroContractAddress, abi, signer);

                try {
                    await contract.getHeroInfo(nftContract, tokenId);
                } catch (error) {
                    if (error.message.includes("Hero does not exist")) {
                        throw new Error("This hero has not been created yet. Please create the hero first.");
                    }
                    throw error;
                }

                const response = await fetch(`${heroConfig.test.SERVER_API_URL}/hero/${nftContract}/${tokenId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'signature': signature,
                        'message': message,
                        'address': address
                    }
                });

                console.log('Response:', response);

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage;
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.error || errorJson.details || errorText;
                    } catch {
                        errorMessage = errorText;
                    }
                    throw new Error(`Failed to load hero: ${errorMessage}`);
                }

                return response.json();
            } catch (error) {
                console.error('Load hero error:', error);
                throw error;
            }
        },
        save: async (data, signer) => {
            try {
                // Create message for API authentication
                const message = `Save Hero: ${data.nftContract}-${data.tokenId}`;
                const signature = await signer.signMessage(message);
                const address = await signer.getAddress();

                // Create contract instance for transaction data
                const abi = [
                    "function updateHero(address nftContract, uint256 tokenId, string memory name, uint8 race, uint8 gender, uint256 level) external returns (bool)"
                ];
                const heroContractAddress = heroConfig.ethereum.contracts.hero;
                if (!heroContractAddress) {
                    throw new Error('Hero contract address not configured');
                }

                // Validate input data
                if (!data.heroData) {
                    throw new Error('Hero data is required');
                }

                const { name, race, gender, level } = data.heroData;
                if (!name || typeof name !== 'string') {
                    throw new Error('Invalid hero name');
                }
                if (typeof race !== 'number' || race < 0 || race > 4) {
                    throw new Error('Invalid race value (must be 0-4)');
                }
                if (typeof gender !== 'number' || gender < 0 || gender > 1) {
                    throw new Error('Invalid gender value (must be 0-1)');
                }

                // Create contract instance
                const contract = new ethers.Contract(heroContractAddress, abi, signer);
                console.log('Updating hero with params:', {
                    nftContract: data.nftContract,
                    tokenId: data.tokenId,
                    name: name,
                    race: race,
                    gender: gender,
                    level: level || 1
                });

                // Send transaction
                const tx = await contract.updateHero(
                    data.nftContract,
                    ethers.getBigInt(data.tokenId),
                    name,
                    Number(race),
                    Number(gender),
                    ethers.getBigInt(level || 1)
                );

                // Wait for transaction confirmation
                const receipt = await tx.wait();
                console.log('Transaction receipt:', receipt);

                // Make API request with transaction hash
                const response = await fetch(`${heroConfig.test.SERVER_API_URL}/hero/save`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'signature': signature,
                        'message': message,
                        'address': address
                    },
                    body: JSON.stringify({
                        ...data,
                        transactionHash: receipt.hash
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    let errorMessage;
                    try {
                        const errorJson = JSON.parse(errorText);
                        errorMessage = errorJson.error || errorJson.details || errorText;
                    } catch {
                        errorMessage = errorText;
                    }
                    throw new Error(`Failed to save hero: ${errorMessage}`);
                }

                return response.json();
            } catch (error) {
                console.error('Save hero error:', error);
                if (error.message.includes('missing revert data')) {
                    throw new Error('Failed to save hero: The transaction was rejected by the contract. Please check your hero data and try again.');
                }
                throw error;
            }
        }
    }
};

export default api; 