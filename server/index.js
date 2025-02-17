import express from 'express';
import cors from 'cors';
import heroApi from './chain/hero-api.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import { nodeRouter } from './node/index.js';
import dotenv from 'dotenv'; // 如果使用 ES 模块
dotenv.config(); // 加载 .env 文件中的变量

// Server configuration
const config = {
    port: process.env.SERVER_PORT || 3017,
    SERVER_API_URL: process.env.SERVER_API_URL,
    ethereum: {
        contracts: {
            hero: process.env.HERO_CONTRACT_ADDRESS,
            heroNFT: process.env.HERO_NFT_CONTRACT_ADDRESS,
            heroMetadata: process.env.HERO_METADATA_CONTRACT_ADDRESS
        }
    }
};
  console.log(`Register URL: ${config.SERVER_API_URL}/node/register`);
// 执行自检
function checkServices() {
    console.log('\n🔍 Arcadia Node Service Self-Check');
    console.log('=====================================');
    
    // 检查环境变量
    console.log('\n📌 Environment Variables:');
    const envVars = {
        'SERVER_PORT': process.env.SERVER_PORT || '3017 (default)',
        'CLIENT_PORT': process.env.CLIENT_PORT || '3008 (default)',
        'ETHEREUM_RPC_URL': process.env.ETHEREUM_RPC_URL ? 'Set' : 'Not set',
        'OPTIMISM_TESTNET_RPC_URL': process.env.OPTIMISM_TESTNET_RPC_URL ? 'Set' : 'Not set',
        'HERO_CONTRACT_ADDRESS': process.env.HERO_CONTRACT_ADDRESS ? 'Set' : 'Not set',
        'HERO_NFT_CONTRACT_ADDRESS': process.env.HERO_NFT_CONTRACT_ADDRESS ? 'Set' : 'Not set',
        'HERO_METADATA_CONTRACT_ADDRESS': process.env.HERO_METADATA_CONTRACT_ADDRESS ? 'Set' : 'Not set'
    };
    
    for (const [key, value] of Object.entries(envVars)) {
        console.log(`  ${value === 'Not set' ? '❌' : '✅'} ${key}: ${value}`);
    }

    // 检查 API 端点
    console.log('\n📌 Available API Endpoints:');
    const endpoints = [
        { method: 'GET', path: '/api/health', desc: 'Service health check' },
        { method: 'GET', path: '/api/hero', desc: 'Hero API' },
        { method: 'GET', path: '/api/v1/node', desc: 'Node API' }
    ];
    
    for (const ep of endpoints) {
        console.log(`  ${ep.method.padEnd(6)} ${ep.path.padEnd(40)} ${ep.desc}`);
    }

    // 检查 CORS 配置
    console.log('\n📌 CORS Configuration:');
    const corsOrigins = [
        `http://localhost:${process.env.CLIENT_PORT || 3008}`,
        `http://localhost:${process.env.SERVER_PORT || 3017}`
    ];
    for (const origin of corsOrigins) {
        console.log(`  ✅ Allowed Origin: ${origin}`);
    }

    console.log('\n📌 Service Status:');
    console.log(`  ✅ Server running on http://localhost:${process.env.SERVER_PORT || 3017}`);
    console.log(`  ✅ Client expected on http://localhost:${process.env.CLIENT_PORT || 3008}`);
    
    console.log('\n=====================================\n');
}

// 执行自检
checkServices();

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3008', 'http://localhost:3017'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'signature', 'message', 'address']
}));
app.use(express.json());

// Basic route for testing
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Hero API
app.use('/api/hero', heroApi);

// Node API
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

// Start server
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
    console.log('Environment:', process.env.NODE_ENV || 'development');
    console.log('Contract addresses:', config.ethereum.contracts);
}); 