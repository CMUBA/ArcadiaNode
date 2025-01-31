const express = require('express');
const path = require('node:path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 基础服务路由 (/api/v1/...)
app.use('/api/v1/node', require('./server/node-management'));
app.use('/api/v1/service', require('./server/service-management'));
app.use('/api/v1/user', require('./server/user-management'));
app.use('/api/v1/chain', require('./server/chain-management'));

// 扩展服务路由 (/apiex/v1/...)
app.use('/apiex/v1/game', require('./game/game-service'));
app.use('/apiex/v1/comment', require('./game/comment-service'));
app.use('/apiex/v1/item', require('./game/item-service'));
app.use('/apiex/v1/asset', require('./game/asset-service'));

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