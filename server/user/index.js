const express = require('express');
const router = express.Router();

// 用户注册
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    // Logic for user registration
    res.json({ message: 'User registered successfully', username });
});

// 用户登录
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Logic for user login
    res.json({ message: 'User logged in successfully', username });
});

module.exports = router; 