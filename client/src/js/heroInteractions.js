// Hero contract interaction functions
export const heroInteractions = {
    // Get hero information
    async getHeroInfo(heroContract, nftContract, tokenId) {
        try {
            const info = await heroContract.getHeroInfo(nftContract.address, tokenId);
            return {
                name: info[0],
                race: ['Human', 'Elf', 'Dwarf', 'Orc', 'Undead'][info[1]],
                gender: ['Male', 'Female'][info[2]],
                level: info[3],
                energy: info[4],
                dailyPoints: info[5]
            };
        } catch (error) {
            console.error('Get hero info error:', error);
            throw error;
        }
    },

    // Update hero skill
    async updateSkill(heroContract, nftContract, tokenId, season, skillIndex, level) {
        try {
            const tx = await heroContract.updateSkill(
                nftContract.address,
                tokenId,
                season,
                skillIndex,
                level
            );
            await tx.wait();
            return true;
        } catch (error) {
            console.error('Update skill error:', error);
            throw error;
        }
    },

    // Get hero skills
    async getHeroSkills(heroContract, nftContract, tokenId, season) {
        try {
            const skills = await heroContract.getHeroSkills(nftContract.address, tokenId, season);
            return skills;
        } catch (error) {
            console.error('Get hero skills error:', error);
            throw error;
        }
    },

    // Update hero equipment
    async updateEquipment(heroContract, nftContract, tokenId, slot, equipContract, equipTokenId) {
        try {
            const tx = await heroContract.updateEquipment(
                nftContract.address,
                tokenId,
                slot,
                equipContract,
                equipTokenId
            );
            await tx.wait();
            return true;
        } catch (error) {
            console.error('Update equipment error:', error);
            throw error;
        }
    },

    // Get hero equipment
    async getHeroEquipment(heroContract, nftContract, tokenId) {
        try {
            const equipment = await heroContract.getHeroEquipment(nftContract.address, tokenId);
            return equipment;
        } catch (error) {
            console.error('Get hero equipment error:', error);
            throw error;
        }
    },

    // Consume hero energy
    async consumeEnergy(heroContract, nftContract, tokenId, amount) {
        try {
            const tx = await heroContract.consumeEnergy(nftContract.address, tokenId, amount);
            await tx.wait();
            return true;
        } catch (error) {
            console.error('Consume energy error:', error);
            throw error;
        }
    },

    // Add daily points
    async addDailyPoints(heroContract, nftContract, tokenId, amount) {
        try {
            const tx = await heroContract.addDailyPoints(nftContract.address, tokenId, amount);
            await tx.wait();
            return true;
        } catch (error) {
            console.error('Add daily points error:', error);
            throw error;
        }
    },

    // Format hero data for display
    formatHeroData(heroData) {
        return {
            name: heroData.name,
            race: ['Human', 'Elf', 'Dwarf', 'Orc', 'Undead'][heroData.race],
            gender: ['Male', 'Female'][heroData.gender],
            level: heroData.level.toString(),
            energy: heroData.energy.toString(),
            dailyPoints: heroData.dailyPoints.toString()
        };
    },

    // Format equipment data for display
    formatEquipmentData(equipment) {
        return equipment.map(item => ({
            slot: ['Weapon', 'Armor', 'Accessory'][item.slot],
            contractAddress: item.contractAddress,
            tokenId: item.tokenId.toString()
        }));
    }
};
