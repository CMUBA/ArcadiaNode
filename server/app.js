const express = require('express');
const path = require('node:path');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 路由
app.use('/api/node', require('./node-management'));
app.use('/api/service', require('./service-management'));
app.use('/api/user', require('./user-management'));
app.use('/api/chain', require('./chain-management'));

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 