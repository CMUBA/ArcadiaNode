const express = require('express');
const cors = require('cors');
const nodeRouter = require('./node/index.js');
const path = require('node:path');
const fs = require('node:fs/promises');
require('dotenv').config();

// 插件管理器
class PluginManager {
    constructor() {
        this.plugins = new Map();
        this.pluginsConfig = null;
    }

    async loadPluginsConfig() {
        try {
            const configPath = path.join(__dirname, 'plugins', 'plugin.json');
            const configData = await fs.readFile(configPath, 'utf8');
            this.pluginsConfig = JSON.parse(configData);
        } catch (error) {
            console.error('Error loading plugins config:', error);
            this.pluginsConfig = { plugins: [] };
        }
    }

    async initializePlugins() {
        if (!this.pluginsConfig) {
            await this.loadPluginsConfig();
        }

        for (const pluginConfig of this.pluginsConfig.plugins) {
            if (pluginConfig.enabled) {
                try {
                    const pluginPath = path.join(__dirname, 'plugins', pluginConfig.path);
                    const plugin = require(pluginPath);
                    const instance = plugin.createPlugin(pluginConfig.config);
                    await instance.start();
                    this.plugins.set(pluginConfig.name, instance);
                    console.log(`Plugin ${pluginConfig.name} initialized successfully`);
                } catch (error) {
                    console.error(`Error initializing plugin ${pluginConfig.name}:`, error);
                }
            }
        }
    }

    getPlugin(name) {
        return this.plugins.get(name);
    }

    async getAllPlugins() {
        const result = [];
        for (const [name, plugin] of this.plugins) {
            const health = await plugin.healthCheck();
            result.push({ name, health });
        }
        return result;
    }
}

// 创建插件管理器实例
const pluginManager = new PluginManager();

// 执行自检
function checkServices() {
    console.log('\n🔍 Arcadia Node Service Self-Check');
    console.log('=====================================');
    
    // 检查环境变量
    console.log('\n📌 Environment Variables:');
    const envVars = {
        'SERVER_PORT': process.env.SERVER_PORT || '3017 (default)',
        'CLIENT_PORT': process.env.CLIENT_PORT || '3008 (default)',
        'NODE_REGISTRY_ADDRESS': process.env.NODE_REGISTRY_ADDRESS || 'Not set',
        'OPTIMISM_TESTNET_RPC_URL': process.env.OPTIMISM_TESTNET_RPC_URL ? 'Set' : 'Not set',
        'NODE_PRIVATE_KEY': process.env.NODE_PRIVATE_KEY ? 'Set' : 'Not set'
    };
    
    for (const [key, value] of Object.entries(envVars)) {
        console.log(`  ${value === 'Not set' ? '❌' : '✅'} ${key}: ${value}`);
    }

    // 检查API端点
    console.log('\n📌 Available API Endpoints:');
    const endpoints = [
        { method: 'GET', path: '/', desc: 'Service health check' },
        { method: 'GET', path: '/api/v1/node/get-challenge', desc: 'Get challenge for node registration' },
        { method: 'POST', path: '/api/v1/node/register', desc: 'Register new node' },
        { method: 'GET', path: '/api/v1/plugins', desc: 'List all plugins' },
        { method: 'POST', path: '/api/v1/plugins/:name/start', desc: 'Start a plugin' },
        { method: 'POST', path: '/api/v1/plugins/:name/stop', desc: 'Stop a plugin' },
        { method: 'GET', path: '/api/v1/plugins/:name/health', desc: 'Check plugin health' }
    ];
    
    for (const ep of endpoints) {
        console.log(`  ${ep.method.padEnd(6)} ${ep.path.padEnd(40)} ${ep.desc}`);
    }

    // 检查CORS配置
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
app.get('/', async (req, res) => {
    try {
        const plugins = await pluginManager.getAllPlugins();
        const serverInfo = {
            name: 'Arcadia Node Server',
            version: '1.0.0',
            uptime: process.uptime(),
            plugins: plugins.map(plugin => ({
                name: plugin.name,
                status: plugin.health.status,
                details: plugin.health
            }))
        };
        res.json(serverInfo);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to get server info',
            details: error.message
        });
    }
});

// API 路由
app.use('/api/v1/node', nodeRouter);

// 插件路由
app.get('/api/v1/plugins', async (req, res, next) => {
    try {
        const plugins = await pluginManager.getAllPlugins();
        res.json(plugins);
    } catch (error) {
        next(error);
    }
});

// 插件特定路由
app.use('/api/v1/discuss', (req, res, next) => {
    const discussPlugin = pluginManager.getPlugin('discuss');
    if (!discussPlugin) {
        return res.status(404).json({ error: 'Discuss plugin not found' });
    }
    discussPlugin.router(req, res, next);
});

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
async function startServer() {
    try {
        // 初始化插件
        await pluginManager.initializePlugins();
        
        // 启动服务器
        app.listen(PORT, () => {
            console.log('\n🚀 Server is now running and ready for requests!');
            console.log('Available routes:');
            console.log('- GET  /');
            console.log('- GET  /api/v1/node/get-challenge');
            console.log('- POST /api/v1/node/register');
            console.log('- GET  /api/v1/plugins');
            console.log('- GET  /api/v1/discuss/posts');
            console.log('- POST /api/v1/discuss/posts');
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
}

// 启动服务器
startServer(); 