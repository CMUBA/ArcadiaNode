const express = require('express');
const cors = require('cors');
const nodeRouter = require('./node');
const envRouter = require('./env');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3017;

// 中间件
app.use(cors({
    origin: ['http://localhost:3008', 'http://localhost:3017'],
    credentials: true
}));
app.use(express.json());

// 基础路由
app.get('/', (req, res) => {
    res.send('Arcadia Server Providing Basic Services.');
});

// API 路由
app.use('/api/v1/node', nodeRouter);
app.use('/api/v1/env', envRouter);

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
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
}); 