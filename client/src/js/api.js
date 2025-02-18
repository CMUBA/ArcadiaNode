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
            // Create message for API authentication
            const message = `Save Hero: ${data.nftContract}-${data.tokenId}`;
            const signature = await signer.signMessage(message);
            const address = await signer.getAddress();

            // Create contract instance for transaction data
            const abi = [
                "function updateHero(address nftContract, uint256 tokenId, string memory name, uint8 race, uint8 gender, uint256 level) external returns (bool)"
            ];
            const heroContractAddress = import.meta.env.VITE_HERO_CONTRACT_ADDRESS;
            if (!heroContractAddress) {
                throw new Error('Hero contract address not configured');
            }

            // Convert numeric values to appropriate types
            const tokenId = ethers.getBigInt(data.tokenId);
            const level = ethers.getBigInt(data.heroData.level || 1);
            const race = Number(data.heroData.race || 0);
            const gender = Number(data.heroData.gender || 0);

            // Create contract instance
            const contract = new ethers.Contract(heroContractAddress, abi, signer);

            // Send transaction
            const tx = await contract.updateHero(
                data.nftContract,
                tokenId,
                data.heroData.name || '',
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
                    ...data,
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
    }
}; 