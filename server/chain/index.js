const express = require('express');
const router = express.Router();

// 链交互
router.post('/interact', (req, res) => {
    const { action, data } = req.body;
    // Logic for chain interaction
    res.json({ message: 'Chain interaction successful', action, data });
});

module.exports = router; 