const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs'); // Changed to bcryptjs for native node compatibility

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

// Update User Profile
router.put('/profile', requireAuth, async (req, res) => {
    const userId = req.session.userId;
    const { name, password } = req.body;

    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Name is required' });
    }

    try {
        if (password && password.trim() !== '') {
            // Hash new password
           
            db.run("UPDATE users SET password = ? WHERE id = ?", [ password, userId], function (err) {
                if (err) return res.status(500).json({ message: 'Database error updating profile and password' });

                // Fetch updated user to return safely
                db.get("SELECT id, name, email FROM users WHERE id = ?", [userId], (err, user) => {
                    if (err || !user) return res.status(500).json({ message: 'Error fetching updated user' });
                    res.json({ message: 'Profile and password updated successfully', user });
                });
            });
        } else {
            // Update only name
            db.run("UPDATE users SET name = ? WHERE id = ?", [name, userId], function (err) {
                if (err) return res.status(500).json({ message: 'Database error updating profile' });

                db.get("SELECT id, name, email FROM users WHERE id = ?", [userId], (err, user) => {
                    if (err || !user) return res.status(500).json({ message: 'Error fetching updated user' });
                    res.json({ message: 'Profile updated successfully', user });
                });
            });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Server error updating profile' });
    }
});

module.exports = router;
