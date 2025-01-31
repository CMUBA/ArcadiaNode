const express = require('express');
const router = express.Router();

// Example endpoint for game service
router.post('/hero/create', (req, res) => {
    const { heroName, heroClass } = req.body;
    // Logic for creating a hero
    res.json({ message: 'Hero created successfully', heroName, heroClass });
});

module.exports = router; 