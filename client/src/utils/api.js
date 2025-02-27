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
                console.log('Loading hero with params:', { nftContract, tokenId });
                
                // 输入验证
                if (!nftContract || !ethers.isAddress(nftContract)) {
                    throw new Error('Invalid NFT contract address');
                }
                if (!tokenId || Number.isNaN(Number(tokenId))) {
                    throw new Error('Invalid token ID');
                }
                if (!signer) {
                    throw new Error('Signer is required');
                }

                // Create message for API authentication
                const message = `Load Hero: ${nftContract}-${tokenId}`;
                const signature = await signer.signMessage(message);
                const address = await signer.getAddress();
                console.log('Authentication prepared:', { message, address });

                // 尝试使用 API 加载英雄
                try {
                    console.log('Attempting to load hero via API...');
                    console.log('API URL:', `${heroConfig.test.SERVER_API_URL}/hero/${nftContract}/${tokenId}`);
                    
                    const response = await fetch(`${heroConfig.test.SERVER_API_URL}/hero/${nftContract}/${tokenId}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'signature': signature,
                            'message': message,
                            'address': address
                        }
                    });

                    console.log('API Response status:', response.status);
                    
                    if (response.ok) {
                        const data = await response.json();
                        console.log('Hero loaded from API:', data);
                        return {
                            success: true,
                            hero: data
                        };
                    } else {
                        const errorText = await response.text();
                        console.error('API error response:', errorText);
                        console.log('Falling back to direct contract call...');
                    }
                } catch (apiError) {
                    console.error('API load failed:', apiError);
                    console.log('Falling back to direct contract call...');
                }

                // 如果 API 调用失败，直接调用合约
                console.log('Loading hero directly from contract...');
                const heroContractAddress = heroConfig.ethereum.contracts.hero;
                
                if (!heroContractAddress) {
                    throw new Error('Hero contract address not configured');
                }
                
                console.log('Hero contract address:', heroContractAddress);
                
                // 使用正确的 ABI 结构
                const heroContract = new ethers.Contract(
                    heroContractAddress,
                    [
                        "function getHeroInfo(address nftContract, uint256 tokenId) view returns (tuple(string name, uint8 race, uint8 gender, uint256 level, uint256 energy, uint256 dailyPoints))"
                    ],
                    signer
                );
                
                const heroInfo = await heroContract.getHeroInfo(nftContract, tokenId);
                console.log('Hero loaded from contract:', heroInfo);
                
                // 格式化结果
                return {
                    success: true,
                    hero: {
                        name: heroInfo.name,
                        race: heroInfo.race.toString(),
                        gender: heroInfo.gender.toString(),
                        level: heroInfo.level.toString(),
                        energy: heroInfo.energy.toString(),
                        dailyPoints: heroInfo.dailyPoints.toString()
                    }
                };
            } catch (error) {
                console.error('Load hero error:', error);
                return {
                    success: false,
                    error: error.message
                };
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