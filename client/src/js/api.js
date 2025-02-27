// API configuration
const SERVER_PORT = import.meta.env.VITE_SERVER_PORT || '3017';
const API_BASE_URL = `http://localhost:${SERVER_PORT}/api/v1`;

export const api = {
    node: {
        getChallenge: () => fetch(`${API_BASE_URL}/node/get-challenge`),
        register: (data) => fetch(`${API_BASE_URL}/node/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
    },
    save: async (data, signer) => {
        try {
            if (!data.nftContract || !data.tokenId || !data.heroData) {
                throw new Error('Missing required parameters');
            }

            // Create message for API authentication
            const message = `Save Hero: ${data.nftContract}-${data.tokenId}`;
            const signature = await signer.signMessage(message);
            const address = await signer.getAddress();

            // Create contract instance
            const heroContractAddress = import.meta.env.VITE_HERO_CONTRACT_ADDRESS;
            if (!heroContractAddress) {
                throw new Error('Hero contract address not configured');
            }

            // Convert numeric values to appropriate types
            const tokenId = ethers.getBigInt(data.tokenId);
            const race = Number(data.heroData.race || 0);
            const gender = Number(data.heroData.gender || 0);
            const level = ethers.getBigInt(data.heroData.level || 1);

            // Validate parameters
            if (race > 4) throw new Error('Invalid race value');
            if (gender > 1) throw new Error('Invalid gender value');
            if (data.heroData.name && data.heroData.name.length > 16) {
                throw new Error('Hero name too long (max 16 characters)');
            }

            // Create contract instance with the correct ABI
            const abi = [
                "function createHero(address nftContract, uint256 tokenId, string memory name, uint8 race, uint8 gender) external",
                "function updateHero(address nftContract, uint256 tokenId, string memory name, uint8 race, uint8 gender, uint256 level) external"
            ];
            const contract = new ethers.Contract(heroContractAddress, abi, signer);

            // Send transaction
            const tx = await contract.updateHero(
                data.nftContract,
                tokenId,
                data.heroData.name || "",
                race,
                gender,
                level
            );

            // Wait for transaction confirmation
            const receipt = await tx.wait();

            // Make API request with transaction hash
            const response = await fetch(`${API_BASE_URL}/hero/save`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'signature': signature,
                    'message': message,
                    'address': address
                },
                body: JSON.stringify({
                    nftContract: data.nftContract,
                    tokenId: data.tokenId.toString(),
                    heroData: {
                        name: data.heroData.name || "",
                        race: race,
                        gender: gender,
                        level: level.toString()
                    },
                    transactionHash: receipt.hash
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error: ${response.status} - ${errorText}`);
            }

            return response.json();
        } catch (error) {
            console.error('Save hero error:', error);
            throw error;
        }
    },
    hero: {
        create: async (data, signer) => {
            try {
                console.log('Creating hero with params:', data);
                
                // Input validation
                if (!data.nftContract || !ethers.isAddress(data.nftContract)) {
                    throw new Error('Invalid NFT contract address');
                }
                if (!data.tokenId || Number.isNaN(Number(data.tokenId))) {
                    throw new Error('Invalid token ID');
                }
                if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
                    throw new Error('Invalid hero name');
                }
                if (data.race === undefined || data.race < 0 || data.race > 4) {
                    throw new Error('Invalid race value (must be 0-4)');
                }
                if (data.gender === undefined || data.gender < 0 || data.gender > 1) {
                    throw new Error('Invalid gender value (must be 0-1)');
                }

                // Create message for API authentication
                const message = `Create Hero: ${data.nftContract}-${data.tokenId}`;
                const signature = await signer.signMessage(message);
                const address = await signer.getAddress();

                // Try to create hero via API first
                try {
                    console.log('Attempting to create hero via API...');
                    const response = await fetch(`${API_BASE_URL}/hero/create`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'signature': signature,
                            'message': message,
                            'address': address
                        },
                        body: JSON.stringify({
                            nftContract: data.nftContract,
                            tokenId: data.tokenId,
                            name: data.name,
                            race: data.race,
                            gender: data.gender || 0
                        })
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        console.log('API Response:', response);
                        console.log('Response text:', errorText);
                        throw new Error(`Error: ${response.status} - ${errorText}`);
                    }

                    const result = await response.json();
                    console.log('API create hero result:', result);
                    return result;
                } catch (apiError) {
                    console.error('API create hero error:', apiError);
                    console.log('Falling back to direct contract call...');
                    
                    // If API fails, fall back to direct contract call
                    // Call the contract
                    const heroContractAddress = import.meta.env.VITE_HERO_CONTRACT_ADDRESS;
                    if (!heroContractAddress) {
                        throw new Error('Hero contract address not configured');
                    }
                    
                    // Use the correct ABI structure
                    const heroContract = new ethers.Contract(heroContractAddress, [
                        "function createHero(address nftContract, uint256 tokenId, string memory name, uint8 race, uint8 gender) external",
                        "function getHeroInfo(address nftContract, uint256 tokenId) view returns (tuple(string name, uint8 race, uint8 gender, uint256 level, uint256 energy, uint256 dailyPoints))"
                    ], signer);
                    
                    const tx = await heroContract.createHero(
                        data.nftContract, 
                        data.tokenId, 
                        data.name, 
                        data.race, 
                        data.gender || 0
                    );
                    console.log('Create hero transaction sent:', tx.hash);
                    
                    // Wait for confirmation
                    const receipt = await tx.wait();
                    console.log('Create hero transaction confirmed:', receipt);

                    // Get hero info to return
                    const heroInfo = await heroContract.getHeroInfo(data.nftContract, data.tokenId);
                    console.log('Hero created successfully:', heroInfo);

                    return {
                        success: true,
                        message: 'Hero created successfully',
                        transactionHash: tx.hash,
                        hero: {
                            name: heroInfo.name,
                            race: heroInfo.race,
                            gender: heroInfo.gender,
                            level: heroInfo.level.toString(),
                            energy: heroInfo.energy.toString(),
                            dailyPoints: heroInfo.dailyPoints.toString()
                        }
                    };
                }
            } catch (error) {
                console.error('Create hero error:', error);
                throw error;
            }
        },
    },
    loadHero: async (nftContract, tokenId) => {
        try {
            console.log('Loading hero with params:', { nftContract, tokenId });
            
            // Input validation
            if (!nftContract || !ethers.isAddress(nftContract)) {
                throw new Error('Invalid NFT contract address');
            }
            if (!tokenId || Number.isNaN(Number(tokenId))) {
                throw new Error('Invalid token ID');
            }

            // 尝试使用 API 加载英雄
            try {
                console.log('Attempting to load hero via API...');
                const response = await fetch(`/api/v1/hero/${nftContract}/${tokenId}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('Hero loaded from API:', data);
                    return {
                        success: true,
                        hero: data
                    };
                }
                console.log('API load failed, falling back to direct contract call');
            } catch (apiError) {
                console.warn('API load failed, falling back to direct contract call:', apiError);
            }

            // 如果 API 调用失败，直接调用合约
            const heroContractAddress = import.meta.env.VITE_HERO_CONTRACT_ADDRESS;
            if (!heroContractAddress) {
                throw new Error('Hero contract address not configured');
            }
            
            console.log('Loading hero directly from contract...');
            
            // 使用正确的 ABI 结构，包括两种可能的返回类型
            const heroContract = new ethers.Contract(heroContractAddress, [
                // 返回结构体的版本
                "function getHeroInfo(address nftContract, uint256 tokenId) view returns (tuple(string name, uint8 race, uint8 gender, uint256 level, uint256 energy, uint256 dailyPoints))",
                // 返回多个参数的版本
                "function getHeroInfo(address nftContract, uint256 tokenId) view returns (string memory name, uint8 race, uint8 gender, uint256 level, uint256 energy, uint256 dailyPoints)"
            ], signer);
            
            try {
                const heroInfo = await heroContract.getHeroInfo(nftContract, tokenId);
                console.log('Hero loaded successfully from contract:', heroInfo);
                
                // 处理不同的返回结构
                let hero;
                
                // 如果返回的是一个结构体（tuple）
                if (heroInfo && typeof heroInfo === 'object' && !Array.isArray(heroInfo)) {
                    hero = {
                        name: heroInfo.name,
                        race: heroInfo.race,
                        gender: heroInfo.gender,
                        level: heroInfo.level.toString(),
                        energy: heroInfo.energy.toString(),
                        dailyPoints: heroInfo.dailyPoints.toString()
                    };
                } 
                // 如果返回的是多个参数（数组）
                else if (Array.isArray(heroInfo)) {
                    hero = {
                        name: heroInfo[0],
                        race: heroInfo[1],
                        gender: heroInfo[2],
                        level: heroInfo[3].toString(),
                        energy: heroInfo[4].toString(),
                        dailyPoints: heroInfo[5].toString()
                    };
                }
                
                return {
                    success: true,
                    hero
                };
            } catch (contractError) {
                console.error('Contract call error:', contractError);
                throw new Error(`Contract error: ${contractError.message}`);
            }
        } catch (error) {
            console.error('Load hero error:', error);
            throw new Error(`Failed to load hero: ${error.message}`);
        }
    },
    saveHero: async (nftContract, tokenId, heroData) => {
        try {
            console.log('Saving hero with params:', { nftContract, tokenId, heroData });
            
            // Input validation
            if (!nftContract || !ethers.isAddress(nftContract)) {
                throw new Error('Invalid NFT contract address');
            }
            if (!tokenId || Number.isNaN(Number(tokenId))) {
                throw new Error('Invalid token ID');
            }
            if (!heroData || typeof heroData !== 'object') {
                throw new Error('Invalid hero data');
            }

            // Validate hero data fields
            const { name, race, gender } = heroData;
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                throw new Error('Invalid hero name');
            }
            if (race === undefined || race < 0 || race > 4) {
                throw new Error('Invalid race value (must be 0-4)');
            }
            if (gender === undefined || gender < 0 || gender > 1) {
                throw new Error('Invalid gender value (must be 0-1)');
            }

            // Call the contract
            const heroContractAddress = import.meta.env.VITE_HERO_CONTRACT_ADDRESS;
            if (!heroContractAddress) {
                throw new Error('Hero contract address not configured');
            }
            const heroContract = new ethers.Contract(heroContractAddress, [
                "function saveHeroFullData(address nftContract, uint256 tokenId, HeroData memory heroData) external"
            ], signer);
            const tx = await heroContract.saveHeroFullData(nftContract, tokenId, heroData);
            console.log('Save hero transaction sent:', tx.hash);
            
            // Wait for confirmation
            const receipt = await tx.wait();
            console.log('Save hero transaction confirmed:', receipt);

            // Get updated hero info
            const heroInfo = await heroContract.getHeroInfo(nftContract, tokenId);
            console.log('Hero saved successfully:', heroInfo);

            return {
                success: true,
                message: 'Hero saved successfully',
                transactionHash: tx.hash,
                hero: {
                    name: heroInfo.name,
                    race: heroInfo.race,
                    gender: heroInfo.gender,
                    level: heroInfo.level.toString(),
                    energy: heroInfo.energy.toString(),
                    dailyPoints: heroInfo.dailyPoints.toString()
                }
            };
        } catch (error) {
            console.error('Save hero error:', error);
            throw new Error(`Failed to save hero: ${error.message}`);
        }
    }
}; 