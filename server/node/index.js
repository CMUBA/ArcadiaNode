const express = require('express');
const { randomBytes } = require('node:crypto');
const { ethers } = require('ethers');
const router = express.Router();

// 存储挑战字符串
const challengeStore = new Map();

// 生成随机挑战字符串
router.get('/get-challenge', (req, res) => {
    try {
        // 使用 crypto.getRandomValues() 生成随机字节
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        const randomBytes32 = Buffer.from(array);
        
        // 计算 keccak256 哈希确保是 32 字节
        const challenge = ethers.keccak256(randomBytes32);
        
        console.log('Challenge generation:', {
            randomBytes: ethers.hexlify(randomBytes32),
            challenge,
            challengeLength: ethers.getBytes(challenge).length
        });
        
        // set expires time
        const expires = Math.floor(Date.now() / 1000) + 300;
        
        // 存储挑战字符串
        challengeStore.set(challenge, {
            expires,
            used: false
        });

        res.json({
            code: 0,
            message: 'success',
            data: {
                challenge,
                expires
            }
        });
    } catch (error) {
        console.error('Challenge generation error:', error);
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
        console.log('Challenge verification:', {
            receivedChallenge: challenge,
            storedChallenges: Array.from(challengeStore.keys()),
            challengeData: challengeData,
            currentTime: Math.floor(Date.now() / 1000)
        });
        
        if (!challengeData) {
            return res.status(400).json({
                code: 2002,
                message: 'Invalid challenge'
            });
        }

        // 验证是否过期
        if (challengeData.expires < Math.floor(Date.now() / 1000)) {
            console.log('Challenge expired:', {
                expires: challengeData.expires,
                currentTime: Math.floor(Date.now() / 1000)
            });
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
        console.log('Challenge verification:', {
            receivedChallenge: challenge,
            storedChallenges: Array.from(challengeStore.keys()),
            challengeData: challengeData,
            currentTime: Math.floor(Date.now() / 1000)
        });
        
        if (!challengeData) {
            return res.status(400).json({
                code: 2002,
                message: 'Invalid challenge'
            });
        }

        // 验证是否过期
        if (challengeData.expires < Math.floor(Date.now() / 1000)) {
            console.log('Challenge expired:', {
                expires: challengeData.expires,
                currentTime: Math.floor(Date.now() / 1000)
            });
            challengeStore.delete(challenge);
            return res.status(400).json({
                code: 2003,
                message: 'Challenge expired'
            });
        }

        // 验证是否已使用
        if (challengeData.used) {
            console.log('Challenge already used');
            return res.status(400).json({
                code: 2004,
                message: 'Challenge already used'
            });
        }

        try {
            console.log('Registration request:', {
                node_address,
                challenge,
                signature,
                challengeLength: ethers.getBytes(challenge).length
            });

            // 验证签名
            // 完全匹配合约的验证逻辑：
            // bytes32 messageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", challenge));
            const messageBytes = ethers.getBytes(challenge);
            
            // 注意：这里不需要将 prefix 转换为 UTF8 字节，因为它本身就是字节序列
            const prefixBytes = new Uint8Array([
                0x19, ...ethers.toUtf8Bytes("Ethereum Signed Message:\n32")
            ]);
            
            // 使用 Uint8Array 直接拼接字节，模拟 abi.encodePacked
            const prefixedMessage = new Uint8Array(prefixBytes.length + messageBytes.length);
            prefixedMessage.set(prefixBytes);
            prefixedMessage.set(messageBytes, prefixBytes.length);
            
            // 计算哈希
            const prefixedMessageHash = ethers.keccak256(prefixedMessage);
            
            console.log('Signature verification details:', {
                challenge,
                challengeHex: ethers.hexlify(messageBytes),
                prefixBytes: ethers.hexlify(prefixBytes),
                prefixedMessageHex: ethers.hexlify(prefixedMessage),
                prefixedMessageHash,
                signature
            });

            // 验证签名
            const recoveredAddress = ethers.recoverAddress(prefixedMessageHash, signature);
            console.log('Signature verification:', {
                recoveredAddress,
                expectedAddress: node_address,
                matches: recoveredAddress.toLowerCase() === node_address.toLowerCase()
            });

            if (recoveredAddress.toLowerCase() !== node_address.toLowerCase()) {
                return res.status(400).json({
                    code: 2005,
                    message: 'Invalid signature'
                });
            }

            // 标记挑战字符串为已使用
            challengeData.used = true;

            // 获取环境变量
            const rpcUrl = process.env.OPTIMISM_TESTNET_RPC_URL;
            const privateKey = process.env.NODE_PRIVATE_KEY;
            const registryAddress = process.env.NODE_REGISTRY_ADDRESS;

            // 验证必要的配置
            if (!rpcUrl) {
                throw new Error('OPTIMISM_TESTNET_RPC_URL not configured');
            }
            if (!privateKey) {
                throw new Error('NODE_PRIVATE_KEY not configured');
            }
            if (!registryAddress) {
                throw new Error('NODE_REGISTRY_ADDRESS not configured');
            }

            // 执行链上注册
            console.log('Initializing provider with RPC URL:', rpcUrl);
            const provider = new ethers.JsonRpcProvider(rpcUrl);
            const wallet = new ethers.Wallet(privateKey, provider);
            
            const abi = [
                "function registerNode(address nodeAddress, string memory ipOrDomain, string memory apiIndexes, bytes32 challenge, bytes memory signature) external"
            ];
            
            console.log('Creating contract instance at address:', registryAddress);
            const contract = new ethers.Contract(registryAddress, abi, wallet);
            
            // 准备合约调用参数
            const contractCallParams = {
                nodeAddress: node_address,
                nodeUrl: node_url,
                apiIndexes: node_service_list,
                challenge: challenge,  // 这里的 challenge 已经是 32 字节
                signature: signature
            };

            console.log('Contract call parameters:', {
                params: contractCallParams,
                challengeLength: ethers.getBytes(challenge).length,
                signatureLength: ethers.getBytes(signature).length,
                challengeHex: ethers.hexlify(ethers.getBytes(challenge))
            });
            
            // 调用合约注册节点
            console.log('Calling registerNode function...');
            const tx = await contract.registerNode(
                contractCallParams.nodeAddress,
                contractCallParams.nodeUrl,
                contractCallParams.apiIndexes,
                contractCallParams.challenge,
                signature
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
                    registry_address: registryAddress,
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
                message: 'Registration failed',
                details: error.message
            });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({
            code: 1001,
            message: 'Internal server error',
            details: error.message
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