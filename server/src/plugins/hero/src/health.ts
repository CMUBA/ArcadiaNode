import { ethers } from 'ethers';
import { logger } from '../../../utils/logger';

export interface HealthCheckResult {
    status: 'healthy' | 'unhealthy';
    details: {
        connection: boolean;
        heroContract: boolean;
        heroNftContract: boolean;
        message?: string;
    };
}

export class HealthCheck {
    private provider: ethers.JsonRpcProvider;
    private heroContract: ethers.Contract;
    private heroNftContract: ethers.Contract;

    constructor(
        provider: ethers.JsonRpcProvider,
        heroContract: ethers.Contract,
        heroNftContract: ethers.Contract
    ) {
        this.provider = provider;
        this.heroContract = heroContract;
        this.heroNftContract = heroNftContract;
    }

    async check(): Promise<HealthCheckResult> {
        try {
            // 检查网络连接
            const network = await this.provider.getNetwork();
            logger.info(`Connected to network: ${network.chainId}`);

            // 检查合约连接
            const heroContractCode = await this.provider.getCode(this.heroContract.target);
            const heroNftContractCode = await this.provider.getCode(this.heroNftContract.target);

            const isHeroContractDeployed = heroContractCode !== '0x';
            const isHeroNftContractDeployed = heroNftContractCode !== '0x';

            if (!isHeroContractDeployed || !isHeroNftContractDeployed) {
                return {
                    status: 'unhealthy',
                    details: {
                        connection: true,
                        heroContract: isHeroContractDeployed,
                        heroNftContract: isHeroNftContractDeployed,
                        message: 'One or more contracts not deployed'
                    }
                };
            }

            return {
                status: 'healthy',
                details: {
                    connection: true,
                    heroContract: true,
                    heroNftContract: true
                }
            };
        } catch (error) {
            logger.error('Health check failed:', error);
            return {
                status: 'unhealthy',
                details: {
                    connection: false,
                    heroContract: false,
                    heroNftContract: false,
                    message: error.message
                }
            };
        }
    }
} 