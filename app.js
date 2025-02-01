const express = require('express');
const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 读取服务列表
const serviceList = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/service_list.json'), 'utf8'));

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// 基础服务路由 (/api/v1/...)
app.use('/api/v1/env', require('./server/env'));
app.use('/api/v1/node', require('./server/node'));
app.use('/api/v1/service', require('./server/service'));
app.use('/api/v1/user', require('./server/user'));
app.use('/api/v1/chain', require('./server/chain'));
app.use('/api/v1/health', require('./server/health'));

// 扩展服务路由 (/apiex/v1/...)
app.use('/apiex/v1/game', require('./serverx/gamex'));
app.use('/apiex/v1/comment', require('./serverx/comment'));
app.use('/apiex/v1/item', require('./serverx/item'));
app.use('/apiex/v1/asset', require('./serverx/asset'));

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        code: 1000,
        message: 'Internal Server Error',
        details: err.message
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 