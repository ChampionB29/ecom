const express = require('express');
const router = express.Router();
const db = require('../db');

// Signup
router.post('/signup', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (row) return res.status(400).json({ message: 'User already exists' });

        const newId = 'u' + Date.now();
        db.run("INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)", [newId, name, email, password], function (err) {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.status(201).json({ message: 'User created successfully', user: { id: newId, name, email } });
        });

         req.session.userId = newId;
    });
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    db.get("SELECT * FROM users WHERE email = ? AND password = ?", [email, password], (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Set session
        req.session.userId = user.id;

        res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
    });
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

module.exports = router;
