const express = require('express');
const router = express.Router();

// Example endpoint for comment service
router.post('/create', (req, res) => {
    const { content, author } = req.body;
    // Logic for creating a comment
    res.json({ message: 'Comment created successfully', content, author });
});

module.exports = router; 