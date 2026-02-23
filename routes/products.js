const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all products
router.get('/', (req, res) => {
    db.all("SELECT * FROM products", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving products' });
        }
        res.json(rows);
    });
});

// GET single product
router.get('/:id', (req, res) => {
    db.get("SELECT * FROM products WHERE id = ?", [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ message: 'Error retrieving product' });
        }
        if (row) {
            res.json(row);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    });
});

module.exports = router;
