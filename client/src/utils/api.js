import config from '../config/index.js';
import { ethers } from 'ethers';

const api = {
    node: {
        getChallenge: () => fetch(`${config.SERVER_API_URL}/node/get-challenge`),
        queryNode: (address) => fetch(`${config.SERVER_API_URL}/node/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ address })
        }),
        register: async (data) => {
            try {
                const response = await fetch(`${config.SERVER_API_URL}/node/register`, {
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
        getENS: (address) => fetch(`${config.SERVER_API_URL}/node/ens`, {
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
                const heroContractAddress = config.VITE_HERO_CONTRACT_ADDRESS;
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

                const response = await fetch(`${config.SERVER_API_URL}/hero/create`, {
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

                const response = await fetch(`${config.SERVER_API_URL}/hero/${nftContract}/${tokenId}`, {
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
                    throw new Error(`Error: ${response.status} - ${errorText}`);
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
                const heroContractAddress = config.VITE_HERO_CONTRACT_ADDRESS;
                if (!heroContractAddress) {
                    throw new Error('Hero contract address not configured');
                }

                // Create contract instance
                const contract = new ethers.Contract(heroContractAddress, abi, signer);

                // Send transaction
                const tx = await contract.updateHero(
                    data.nftContract,
                    ethers.getBigInt(data.tokenId),
                    data.heroData.name,
                    Number(data.heroData.race),
                    Number(data.heroData.gender || 0),
                    ethers.getBigInt(data.heroData.level || 1)
                );

                // Wait for transaction confirmation
                const receipt = await tx.wait();

                // Make API request with transaction hash
                const response = await fetch(`${config.SERVER_API_URL}/hero/save`, {
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

                console.log('Response:', response);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error: ${response.status} - ${errorText}`);
                }

                return response.json();
            } catch (error) {
                console.error('Save hero error:', error);
                throw error;
            }
        }
    }
};

export default api; 