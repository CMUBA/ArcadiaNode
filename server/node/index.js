const express = require('express');
const router = express.Router();

// 节点注册
router.post('/register', (req, res) => {
    const { publicKey, ip, port } = req.body;
    // Logic for node registration
    res.json({ message: 'Node registered successfully', publicKey, ip, port });
});

// 节点认证
router.post('/auth', (req, res) => {
    const { timestamp } = req.body;
    // Logic for node authentication
    res.json({ message: 'Node authenticated successfully' });
});

module.exports = router; 