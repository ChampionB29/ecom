const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'secure_data', 'database.sqlite');
const dataDir = path.join(__dirname, 'secure_data');

// Ensure secure data directory exists
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        db.serialize(() => {
            // Create Users Table
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )`);

            // Create Products Table
            db.run(`CREATE TABLE IF NOT EXISTS products (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                price REAL,
                image TEXT
            )`);

            // Check if products table is empty, if so, seed it
            db.get("SELECT COUNT(*) as count FROM products", (err, row) => {
                if (err) return console.error(err);
                if (row.count === 0) {
                    console.log("Seeding products...");
                    const stmt = db.prepare("INSERT INTO products (id, name, description, price, image) VALUES (?, ?, ?, ?, ?)");
                    const productsList = [
                        { id: 'p1', name: 'Wireless Noise-Cancelling Headphones', description: 'Experience pure audio with our industry-leading noise cancellation technology. Features 30-hour battery life and premium comfort.', price: 24999, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800' },
                        { id: 'p2', name: 'Samsung Ultra Watch', description: 'Stay connected in style. Tracks fitness, heart rate, and delivers notifications directly to your wrist with a sleek, low-profile design.', price: 15999, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800' },
                        { id: 'p7', name: 'iPhone 15 Pro Max', description: 'The ultimate smartphone experience. Features an aerospace-grade titanium body, the revolutionary A17 Pro chip, and a pro-class camera system.', price: 159900, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800' },
                        { id: 'p8', name: 'EarBuds Pro', description: 'Immersive sound in an ultra-compact design. Active noise cancellation and transparency mode. Custom fit for all-day comfort.', price: 19999, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=800' },
                        { id: 'p9', name: 'Studio Max', description: 'High-fidelity audio meets unparalleled comfort. Over-ear design with computational audio for a breakthrough listening experience.', price: 44999, image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800' },
                        { id: 'p10', name: 'Fast Charger 65 Watts', description: 'Power up all your devices safely and quickly. Compact GaN technology allows for dual-port charging in an incredibly small footprint.', price: 3999, image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800' },
                        { id: 'p11', name: 'Vivo X100 Pro', description: 'Co-engineered with Zeiss for stunning photography. Features the latest Dimensity 9300 chipset and ultimate fast charging.', price: 89999, image: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202401/vivo-x100-pro-042040544-16x9_1.jpg' },
                        { id: 'p12', name: 'Samsung Galaxy S21 Ultra', description: 'Galaxy AI is here. Epic cameras, built-in S Pen, and the ultimate Snapdragon processor for top-tier performance.', price: 129999, image: 'https://www.sammobile.com/wp-content/uploads/2021/01/Galaxy-S21-Ultra-13-1.jpg' },
                        { id: 'p15', name: 'Samsung Galaxy S20 Ultra', description: '100x Space Zoom. The smartphone that will change photography forever.', price: 69999, image: 'https://www.androidauthority.com/wp-content/uploads/2020/06/Samsung-Galaxy-S20-Ultra-back-at-angle.jpg' }
                    ];

                    productsList.forEach(p => {
                        stmt.run([p.id, p.name, p.description, p.price, p.image]);
                    });
                    stmt.finalize();
                }
            });

            // Create Cart Table
            db.run(`CREATE TABLE IF NOT EXISTS cart (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                productId TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                FOREIGN KEY (userId) REFERENCES users(id),
                FOREIGN KEY (productId) REFERENCES products(id)
            )`);

            // Create Wishlist Table
            db.run(`CREATE TABLE IF NOT EXISTS wishlist (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT NOT NULL,
                productId TEXT NOT NULL,
                FOREIGN KEY (userId) REFERENCES users(id),
                FOREIGN KEY (productId) REFERENCES products(id)
            )`);

            // Create orders table
            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId TEXT,
                totalAmount REAL,
                paymentMethod TEXT,
                shippingAddress TEXT,
                orderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                deliveryDate DATETIME,
                trackId TEXT UNIQUE,
                status TEXT
            )`, (err) => {
                if (err) console.error("Error creating orders table:", err);
            });

            // Create order_items table
            db.run(`CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                orderId INTEGER,
                productId TEXT,
                quantity INTEGER,
                priceAtPurchase REAL,
                FOREIGN KEY(orderId) REFERENCES orders(id)
            )`, (err) => {
                if (err) console.error("Error creating order_items table:", err);
            });
        });
    }
});

module.exports = db;


// deepak chahar
