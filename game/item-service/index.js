const express = require('express');
const router = express.Router();

// Example endpoint for item service
router.post('/buy', (req, res) => {
    const { itemId, quantity } = req.body;
    // Logic for buying an item
    res.json({ message: 'Item purchased successfully', itemId, quantity });
});

module.exports = router; 