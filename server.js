const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const db = require('./db'); // Initialize DB

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: 'champ_secret_key_123',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1800000 } // 30 minutes
}));

// Routes
const productsRouter = require('./routes/products');
const authRouter = require('./routes/auth');
const cartRouter = require('./routes/cart');
const wishlistRouter = require('./routes/wishlist');
const userRouter = require('./routes/user');
const ordersRouter = require('./routes/orders');

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/user', userRouter);
app.use('/api/orders', ordersRouter);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
