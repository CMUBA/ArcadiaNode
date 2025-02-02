const express = require('express');
const cors = require('cors');
const nodeRouter = require('./node/index.js');
require('dotenv').config();

// 添加环境变量调试信息
console.log('Environment Variables Debug Info:');
console.log('----------------------------------------');
console.log('SERVER_PORT:', process.env.SERVER_PORT);
console.log('CLIENT_PORT:', process.env.CLIENT_PORT);
console.log('TEST_AAA:', process.env.TEST_AAA);
console.log('NODE_REGISTRY_ADDRESS:', process.env.NODE_REGISTRY_ADDRESS);
console.log('OPTIMISM_TESTNET_RPC_URL:', process.env.OPTIMISM_TESTNET_RPC_URL ? 
    `(Loaded - First 10 chars: ${process.env.OPTIMISM_TESTNET_RPC_URL.substring(10, 15)}...)` : 
    'Not loaded');
console.log('NODE_PRIVATE_KEY:', process.env.NODE_PRIVATE_KEY ? 
    `(Loaded - Length: ${process.env.NODE_PRIVATE_KEY.length})` : 
    'Not loaded');
console.log('----------------------------------------');

const app = express();
const PORT = process.env.SERVER_PORT || 3017;
const CLIENT_PORT = process.env.CLIENT_PORT || 3008;

// 中间件
app.use(cors({
    origin: [
        `http://localhost:${CLIENT_PORT}`,
        `http://localhost:${PORT}`
    ],
    credentials: true
}));
app.use(express.json());

// 基础路由
app.get('/', (req, res) => {
    res.send('Arcadia Server Providing Basic Services.');
});

// API 路由
app.use('/api/v1/node', nodeRouter);

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        code: 1001,
        message: 'Internal Server Error',
        details: err.message
    });
});

// 404 处理
app.use((req, res) => {
    res.status(404).json({
        code: 1404,
        message: 'Not Found',
        details: `Cannot ${req.method} ${req.url}`
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('- GET  /');
    console.log('- GET  /api/v1/node/get-challenge');
    console.log('- POST /api/v1/node/register');
}); 