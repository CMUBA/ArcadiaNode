const express = require('express');
const router = express.Router();

// Example endpoint for game service
router.post('/', (req, res) => {
    const { input } = req.body;
    // Logic for game service
    res.json({ message: 'Game service response', input });
});

module.exports = router; 