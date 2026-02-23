const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to check session
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

// Get User Wishlist
router.get('/', requireAuth, (req, res) => {
    const userId = req.session.userId;
    db.all("SELECT products.* FROM products JOIN wishlist ON products.id = wishlist.productId WHERE wishlist.userId = ?", [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// Add to wishlist
router.post('/', requireAuth, (req, res) => {
    const { productId } = req.body;
    const userId = req.session.userId;

    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    db.get("SELECT * FROM wishlist WHERE userId = ? AND productId = ?", [userId, productId], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (row) {
            return res.status(400).json({ message: 'Item already in wishlist' });
        } else {
            db.run("INSERT INTO wishlist (userId, productId) VALUES (?, ?)", [userId, productId], (err) => {
                if (err) return res.status(500).json({ message: 'Database error' });
                res.json({ message: 'Item added to wishlist' });
            });
        }
    });
});

// Remove from Wishlist
router.delete('/:productId', requireAuth, (req, res) => {
    const { productId } = req.params;
    const userId = req.session.userId;

    db.run("DELETE FROM wishlist WHERE userId = ? AND productId = ?", [userId, productId], (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Item removed from wishlist' });
    });
});

module.exports = router;
