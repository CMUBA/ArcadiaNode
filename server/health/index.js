const express = require('express');
const router = express.Router();

// 健康检查
router.get('/check', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// 心跳检测
router.post('/heartbeat', (req, res) => {
    const { nodeId } = req.body;
    res.json({
        status: 'alive',
        nodeId,
        timestamp: new Date().toISOString()
    });
});

module.exports = router; 