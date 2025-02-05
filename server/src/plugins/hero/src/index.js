const express = require('express');
const { ethers } = require('ethers');
const { Router } = require('express');
const { logger } = require('../../../utils/logger');
const { HealthCheck } = require('./health');

// 合约 ABI
const heroAbi = require('../../../../../contract/hero/out/Hero.sol/Hero.json').abi;
const heroNftAbi = require('../../../../../contract/hero/out/HeroNFT.sol/HeroNFT.json').abi;

class HeroPlugin {
    constructor(providerUrl, heroContractAddress, heroNftContractAddress) {
        this.router = Router();
        this.provider = new ethers.JsonRpcProvider(providerUrl);
        this.heroContract = new ethers.Contract(heroContractAddress, heroAbi, this.provider);
        this.heroNftContract = new ethers.Contract(heroNftContractAddress, heroNftAbi, this.provider);
        this.healthCheck = new HealthCheck(this.provider, this.heroContract, this.heroNftContract);
        this.initializeRoutes();
        this.startHealthCheck();
    }

    async startHealthCheck() {
        // 初始健康检查
        const initialHealth = await this.healthCheck.check();
        logger.info('Initial health check:', initialHealth);

        // 每5分钟进行一次健康检查
        setInterval(async () => {
            const health = await this.healthCheck.check();
            if (health.status === 'unhealthy') {
                logger.error('Health check failed:', health.details);
            } else {
                logger.debug('Health check passed');
            }
        }, 5 * 60 * 1000);
    }

    initializeRoutes() {
        // 健康检查端点
        this.router.get('/health', async (req, res) => {
            try {
                const health = await this.healthCheck.check();
                res.json(health);
            } catch (error) {
                logger.error('Health check endpoint error:', error);
                res.status(500).json({
                    status: 'unhealthy',
                    details: {
                        connection: false,
                        heroContract: false,
                        heroNftContract: false,
                        message: error.message
                    }
                });
            }
        });

        // 创建英雄
        this.router.post('/create', async (req, res) => {
            try {
                const { userId, name, race, class: heroClass, signer } = req.body;
                const contract = this.heroContract.connect(signer);
                const tx = await contract.createHero(userId, name, race, heroClass);
                const receipt = await tx.wait();
                logger.info(`Hero created: ${receipt.hash}`);
                res.json({ success: true, hash: receipt.hash });
            } catch (error) {
                logger.error('Error creating hero:', error);
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // 加载英雄数据
        this.router.get('/:heroId', async (req, res) => {
            try {
                const { heroId } = req.params;
                const data = await this.heroContract.loadHero(heroId);
                res.json({ success: true, data });
            } catch (error) {
                logger.error('Error loading hero:', error);
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // 保存英雄数据
        this.router.post('/save', async (req, res) => {
            try {
                const { heroId, data, nodeSignature, clientSignature, signer } = req.body;
                const contract = this.heroContract.connect(signer);
                const tx = await contract.saveHero(heroId, data, nodeSignature, clientSignature);
                const receipt = await tx.wait();
                logger.info(`Hero saved: ${receipt.hash}`);
                res.json({ success: true, hash: receipt.hash });
            } catch (error) {
                logger.error('Error saving hero:', error);
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // 获取英雄 NFT 所有者
        this.router.get('/nft/owner/:tokenId', async (req, res) => {
            try {
                const { tokenId } = req.params;
                const owner = await this.heroNftContract.ownerOf(tokenId);
                res.json({ success: true, owner });
            } catch (error) {
                logger.error('Error getting NFT owner:', error);
                res.status(500).json({ success: false, error: error.message });
            }
        });

        // 检查 NFT 是否存在
        this.router.get('/nft/exists/:tokenId', async (req, res) => {
            try {
                const { tokenId } = req.params;
                const exists = await this.heroNftContract.exists(tokenId);
                res.json({ success: true, exists });
            } catch (error) {
                logger.error('Error checking NFT existence:', error);
                res.status(500).json({ success: false, error: error.message });
            }
        });
    }

    getRouter() {
        return this.router;
    }
}

module.exports = { HeroPlugin }; 