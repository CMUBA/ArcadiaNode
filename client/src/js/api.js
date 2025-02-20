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
    createHero: async (nftContract, tokenId, name, race, gender) => {
        try {
            console.log('Creating hero with params:', { nftContract, tokenId, name, race, gender });
            
            // Input validation
            if (!nftContract || !ethers.isAddress(nftContract)) {
                throw new Error('Invalid NFT contract address');
            }
            if (!tokenId || Number.isNaN(Number(tokenId))) {
                throw new Error('Invalid token ID');
            }
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
                "function createHero(address nftContract, uint256 tokenId, string memory name, uint8 race, uint8 gender) external"
            ], signer);
            const tx = await heroContract.createHero(nftContract, tokenId, name, race, gender);
            console.log('Create hero transaction sent:', tx.hash);
            
            // Wait for confirmation
            const receipt = await tx.wait();
            console.log('Create hero transaction confirmed:', receipt);

            // Get hero info to return
            const heroInfo = await heroContract.getHeroInfo(nftContract, tokenId);
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
        } catch (error) {
            console.error('Create hero error:', error);
            throw new Error(`Failed to create hero: ${error.message}`);
        }
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

            // Check if hero exists
            const heroContractAddress = import.meta.env.VITE_HERO_CONTRACT_ADDRESS;
            if (!heroContractAddress) {
                throw new Error('Hero contract address not configured');
            }
            const heroContract = new ethers.Contract(heroContractAddress, [
                "function getHeroInfo(address nftContract, uint256 tokenId) external view returns (HeroInfo)"
            ], signer);
            const heroInfo = await heroContract.getHeroInfo(nftContract, tokenId);
            console.log('Hero loaded successfully:', heroInfo);

            return {
                success: true,
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