const express = require('express');
const router = express.Router();

// 允许获取的环境变量列表
const ALLOWED_ENV_VARS = [
    'NODE_PRIVATE_KEY',
    'NODE_REGISTRY_ADDRESS',
    'RPC_URL'
];

// 格式化私钥
function formatPrivateKey(privateKey) {
    if (!privateKey) return null;
    
    // 移除空格和换行符
    let cleanKey = privateKey.trim();
    
    // 移除可能存在的 0x 前缀
    cleanKey = cleanKey.replace('0x', '');
    
    // 验证是否为有效的十六进制字符串
    if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
        console.log('Invalid private key format. Expected 64 hex characters.');
        return null;
    }
    
    // 添加 0x 前缀并返回
    return `0x${cleanKey}`;
}

// 获取环境变量
router.post('/get', (req, res) => {
    try {
        console.log('Received request body:', req.body);
        
        if (!req.body || typeof req.body !== 'object') {
            console.log('Invalid request body format');
            return res.status(400).json({
                code: 1,
                message: 'Invalid request format'
            });
        }

        const { key } = req.body;
        console.log('Extracted key:', key);
        
        if (!key) {
            console.log('Missing key parameter');
            return res.status(400).json({
                code: 1,
                message: 'Missing key parameter'
            });
        }

        // 检查是否是允许获取的环境变量
        if (!ALLOWED_ENV_VARS.includes(key)) {
            console.log('Access denied for key:', key);
            return res.status(403).json({
                code: 2,
                message: 'Access to this environment variable is not allowed'
            });
        }

        let value = process.env[key];
        console.log('Found value for key:', key, 'Value:', value);
        
        if (typeof value === 'undefined' || value === null || value === '') {
            console.log('Environment variable not found or empty:', key);
            return res.status(404).json({
                code: 3,
                message: 'Environment variable not found or empty'
            });
        }

        // 如果是私钥，确保格式正确
        if (key === 'NODE_PRIVATE_KEY') {
            const formattedKey = formatPrivateKey(value);
            console.log('Formatted private key:', formattedKey ? 'valid' : 'invalid');
            if (!formattedKey) {
                return res.status(400).json({
                    code: 5,
                    message: 'Invalid private key format - must be 64 hexadecimal characters'
                });
            }
            value = formattedKey;
        }

        res.json({
            code: 0,
            value
        });
    } catch (error) {
        console.error('Error getting environment variable:', error);
        res.status(500).json({
            code: 4,
            message: 'Internal server error',
            error: error.message
        });
    }
});

module.exports = router; 