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

// Get User Cart
router.get('/', requireAuth, (req, res) => {
    const userId = req.session.userId;
    db.all("SELECT cart.*, products.name, products.price, products.image FROM cart JOIN products ON cart.productId = products.id WHERE userId = ?", [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// Add to Cart
router.post('/', requireAuth, (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.session.userId;

    if (!productId || !quantity) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
    }

    db.get("SELECT * FROM cart WHERE userId = ? AND productId = ?", [userId, productId], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (row) {
            db.run("UPDATE cart SET quantity = quantity + ? WHERE id = ?", [quantity, row.id], (err) => {
                if (err) return res.status(500).json({ message: 'Database error' });
                res.json({ message: 'Cart updated' });
            });
        } else {
            db.run("INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, ?)", [userId, productId, quantity], (err) => {
                if (err) return res.status(500).json({ message: 'Database error' });
                res.json({ message: 'Item added to cart' });
            });
        }
    });
});

// Remove from Cart
router.delete('/:productId', requireAuth, (req, res) => {
    const { productId } = req.params;
    const userId = req.session.userId;

    db.run("DELETE FROM cart WHERE userId = ? AND productId = ?", [userId, productId], (err) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Item removed from cart' });
    });
});

// Checkout (Clear Cart)
router.post('/checkout', requireAuth, (req, res) => {
    const userId = req.session.userId;
    const { paymentMethod, addBag, address } = req.body;

    if (!address) {
        return res.status(400).json({ message: 'Shipping address is required' });
    }

    // Fetch cart items WITH product price to insert into order_items
    db.all("SELECT cart.*, products.price FROM cart JOIN products ON cart.productId = products.id WHERE userId = ?", [userId], (err, cartItems) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Validate paymentMethod
        if (!['card', 'cod'].includes(paymentMethod)) {
            return res.status(400).json({ message: 'Invalid payment method' });
        }

        // Calculate Total
        let totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (addBag) {
            totalAmount += 500; // Gift bag fee in INR
        }

        // Generate Track ID and Delivery Date
        const trackId = 'TRK-' + Math.random().toString(36).substring(2, 10).toUpperCase();
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 4); // Deliver in 4 days
        const deliveryDateStr = deliveryDate.toISOString();

        // Insert Order
        const status = 'Processing';
        db.run(`INSERT INTO orders (userId, totalAmount, paymentMethod, shippingAddress, deliveryDate, trackId, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, totalAmount, paymentMethod, address, deliveryDateStr, trackId, status], function (err) {
                if (err) return res.status(500).json({ message: 'Error creating order' });

                const orderId = this.lastID;

                // Insert Order Items
                const placeholders = cartItems.map(() => '(?, ?, ?, ?)').join(',');
                const values = [];
                cartItems.forEach(item => {
                    values.push(orderId, item.productId, item.quantity, item.price);
                });

                db.run(`INSERT INTO order_items (orderId, productId, quantity, priceAtPurchase) VALUES ${placeholders}`, values, (err) => {
                    if (err) return res.status(500).json({ message: 'Error creating order items' });

                    // Clear Cart
                    db.run("DELETE FROM cart WHERE userId = ?", [userId], (err) => {
                        if (err) return res.status(500).json({ message: 'Error clearing cart' });

                        res.json({
                            message: 'Checkout successful!',
                            trackId: trackId,
                            deliveryDate: deliveryDateStr
                        });
                    });
                });
            });
    });
});

module.exports = router;
