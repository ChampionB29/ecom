const express = require('express');
const router = express.Router();
const db = require('../db');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
};

// Get User Orders
router.get('/', requireAuth, (req, res) => {
    const userId = req.session.userId;

    db.all(`SELECT * FROM orders WHERE userId = ? ORDER BY orderDate DESC`, [userId], (err, orders) => {
        if (err) return res.status(500).json({ message: 'Database error fetching orders' });

        if (!orders || orders.length === 0) return res.json([]);

        // Fetch items for all orders
        const orderIds = orders.map(o => o.id);
        const placeholders = orderIds.map(() => '?').join(',');

        db.all(`
            SELECT oi.*, p.name, p.image 
            FROM order_items oi
            JOIN products p ON oi.productId = p.id
            WHERE oi.orderId IN (${placeholders})
        `, orderIds, (err, items) => {
            if (err) return res.status(500).json({ message: 'Database error fetching order items' });

            const itemsByOrderId = {};
            items.forEach(item => {
                if (!itemsByOrderId[item.orderId]) {
                    itemsByOrderId[item.orderId] = [];
                }
                itemsByOrderId[item.orderId].push(item);
            });

            const enrichedOrders = orders.map(o => {
                return {
                    ...o,
                    items: itemsByOrderId[o.id] || []
                };
            });

            res.json(enrichedOrders);
        });
    });
});

// Delete (Cancel) Order
router.delete('/:id', requireAuth, (req, res) => {
    const userId = req.session.userId;
    const orderId = req.params.id;

    // First, verify the order belongs to the user
    db.get(`SELECT id FROM orders WHERE id = ? AND userId = ?`, [orderId, userId], (err, order) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!order) return res.status(404).json({ message: 'Order not found or unauthorized' });

        // First delete all associated order_items
        db.run(`DELETE FROM order_items WHERE orderId = ?`, [orderId], function (err) {
            if (err) {
                console.error("Error deleting order items:", err);
                return res.status(500).json({ message: 'Error deleting order items' });
            }

            // Then delete the order itself
            db.run(`DELETE FROM orders WHERE id = ?`, [orderId], function (err) {
                if (err) {
                    console.error("Error deleting order:", err);
                    return res.status(500).json({ message: 'Error deleting order' });
                }
                res.json({ message: 'Order successfully cancelled and removed' });
            });
        });
    });
});

module.exports = router;
