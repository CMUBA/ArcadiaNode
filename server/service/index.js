const express = require('express');
const router = express.Router();

// 服务注册
router.post('/register', (req, res) => {
    const { serviceName, endpoint } = req.body;
    // Logic for service registration
    res.json({ message: 'Service registered successfully', serviceName, endpoint });
});

// 获取服务列表
router.get('/list', (req, res) => {
    // Logic for getting service list
    res.json({
        services: [
            { name: 'node', endpoints: ['/api/v1/node/register', '/api/v1/node/auth'] },
            { name: 'user', endpoints: ['/api/v1/user/register', '/api/v1/user/login'] }
        ]
    });
});

module.exports = router; 