const express = require('express');
const { randomBytes } = require('node:crypto');
const ethers = require('ethers');
const router = express.Router();

// 存储挑战字符串
const challengeStore = new Map();

// 生成随机挑战字符串
router.get('/get-challenge', (req, res) => {
    try {
        // 生成32字节的随机数
        const challenge = randomBytes(32).toString('hex');
        
        // 设置5分钟过期时间
        const expires = Math.floor(Date.now() / 1000) + 300; // 5 minutes
        
        // 存储挑战字符串
        challengeStore.set(challenge, {
            expires,
            used: false
        });

        // 清理过期的挑战字符串
        cleanExpiredChallenges();

        res.json({
            code: 0,
            message: 'success',
            data: {
                challenge,
                expires
            }
        });
    } catch (error) {
        res.status(500).json({
            code: 1001,
            message: 'Failed to generate challenge',
            details: error.message
        });
    }
});

// 签名挑战字符串
router.post('/sign', async (req, res) => {
    try {
        const { challenge } = req.body;

        // 验证挑战字符串
        if (!challenge) {
            return res.status(400).json({
                code: 2001,
                message: 'Challenge string is required'
            });
        }

        // 验证挑战字符串是否存在
        const challengeData = challengeStore.get(challenge);
        if (!challengeData) {
            return res.status(400).json({
                code: 2002,
                message: 'Invalid challenge'
            });
        }

        // 验证是否过期
        if (challengeData.expires < Math.floor(Date.now() / 1000)) {
            challengeStore.delete(challenge);
            return res.status(400).json({
                code: 2003,
                message: 'Challenge expired'
            });
        }

        // 从环境变量获取私钥
        const privateKey = process.env.NODE_PRIVATE_KEY;
        if (!privateKey) {
            return res.status(500).json({
                code: 1002,
                message: 'Node private key not configured'
            });
        }

        // 创建钱包实例
        const wallet = new ethers.Wallet(privateKey);
        
        // 签名挑战字符串
        const signature = await wallet.signMessage(challenge);

        // 返回签名结果
        res.json({
            code: 0,
            message: 'success',
            data: {
                challenge,
                signature,
                address: wallet.address
            }
        });

    } catch (error) {
        res.status(500).json({
            code: 1003,
            message: 'Failed to sign challenge',
            details: error.message
        });
    }
});

// 节点注册
router.post('/register', async (req, res) => {
    try {
        const {
            node_address,
            node_url,
            api_url,
            node_ens,
            node_ip,
            node_service_list,
            registry_contract_address,
            challenge,
            signature
        } = req.body;

        // 验证必要参数
        if (!node_address || !node_url || !challenge || !signature || !node_service_list) {
            return res.status(400).json({
                code: 2001,
                message: 'Missing required parameters'
            });
        }

        // 验证挑战字符串
        const challengeData = challengeStore.get(challenge);
        if (!challengeData) {
            return res.status(400).json({
                code: 2002,
                message: 'Invalid challenge'
            });
        }

        // 验证是否过期
        if (challengeData.expires < Math.floor(Date.now() / 1000)) {
            challengeStore.delete(challenge);
            return res.status(400).json({
                code: 2003,
                message: 'Challenge expired'
            });
        }

        // 验证是否已使用
        if (challengeData.used) {
            return res.status(400).json({
                code: 2004,
                message: 'Challenge already used'
            });
        }

        try {
            console.log('Verifying signature for challenge:', challenge);
            console.log('Signature:', signature);
            console.log('Node address:', node_address);

            // 验证签名
            const messageHash = ethers.hashMessage(challenge);
            console.log('Message hash:', messageHash);
            
            const recoveredAddress = ethers.verifyMessage(challenge, signature);
            console.log('Recovered address:', recoveredAddress);
            
            if (recoveredAddress.toLowerCase() !== node_address.toLowerCase()) {
                console.log('Signature verification failed:');
                console.log('Expected:', node_address.toLowerCase());
                console.log('Got:', recoveredAddress.toLowerCase());
                return res.status(400).json({
                    code: 2005,
                    message: 'Invalid signature'
                });
            }

            console.log('Signature verified successfully');

            // 标记挑战字符串为已使用
            challengeData.used = true;

            // 获取环境变量
            const rpcUrl = process.env.OPTIMISM_TESTNET_RPC_URL;
            const privateKey = process.env.NODE_PRIVATE_KEY;

            if (!rpcUrl) {
                throw new Error('OPTIMISM_TESTNET_RPC_URL not configured');
            }
            if (!privateKey) {
                throw new Error('NODE_PRIVATE_KEY not configured');
            }

            console.log('Initializing provider with RPC URL:', rpcUrl);
            // 调用合约注册节点
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const wallet = new ethers.Wallet(privateKey, provider);
            
            const abi = [
                "function registerNode(address nodeAddress, string memory ipOrDomain, string memory apiIndexes, bytes32 challenge, bytes memory signature) external"
            ];
            
            console.log('Creating contract instance at address:', registry_contract_address);
            const contract = new ethers.Contract(registry_contract_address, abi, wallet);
            
            // 准备合约调用参数
            const contractCallParams = {
                nodeAddress: node_address,
                nodeUrl: node_url,
                apiIndexes: node_service_list,
                challenge: ethers.id(challenge),
                signature
            };
            console.log('Contract call params:', contractCallParams);
            
            // 调用合约注册节点
            console.log('Calling registerNode function...');
            const tx = await contract.registerNode(
                contractCallParams.nodeAddress,
                contractCallParams.nodeUrl,
                contractCallParams.apiIndexes,
                contractCallParams.challenge,
                contractCallParams.signature
            );
            
            console.log('Transaction sent:', tx.hash);
            
            // 等待交易确认
            console.log('Waiting for transaction confirmation...');
            const receipt = await tx.wait();
            console.log('Transaction confirmed:', receipt);

            // 返回成功和交易哈希
            return res.json({
                code: 0,
                message: 'success',
                data: {
                    nodeId: node_address,
                    registry_address: registry_contract_address,
                    tx_hash: receipt.hash
                }
            });
        } catch (error) {
            console.error('Registration process failed:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                code: error.code,
                reason: error.reason
            });
            
            return res.status(500).json({
                code: 1002,
                message: 'Failed to register node',
                details: error.message,
                errorCode: error.code,
                errorReason: error.reason
            });
        }
    } catch (outer_error) {
        console.error('Outer registration error:', outer_error);
        return res.status(500).json({
            code: 1002,
            message: 'Failed to register node',
            details: outer_error.message
        });
    }
});

// 清理过期的挑战字符串
function cleanExpiredChallenges() {
    const now = Math.floor(Date.now() / 1000);
    for (const [challenge, data] of challengeStore.entries()) {
        if (data.expires < now) {
            challengeStore.delete(challenge);
        }
    }
}

// 节点认证
router.post('/auth', (req, res) => {
    const { timestamp } = req.body;
    // Logic for node authentication
    res.json({ message: 'Node authenticated successfully' });
});

module.exports = router; 