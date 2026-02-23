// app.js - Global App Logic and UI Components
const API_BASE_URL = '/api';

// --- API Utils ---
async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        return await response.json();
    } catch (error) {
        console.error("Error fetching products", error);
        return [];
    }
}

async function fetchCartCount() {
    const user = auth.getUser();
    if (!user) {
        updateCartCountBadge(0);
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/cart`);
        if (response.status === 401) return auth.handleSessionTimeout();

        const cart = await response.json();
        // sum quantities
        const count = cart.reduce((acc, item) => acc + item.quantity, 0);
        updateCartCountBadge(count);
    } catch (error) {
        console.error("Error fetching cart count", error);
    }
}

async function addToCart(productId) {
    const user = auth.getUser();
    if (!user) {
        window.location.href = '/login.html'; // redirect to login if not logged in
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (response.status === 401) return auth.handleSessionTimeout();

        if (response.ok) {
            // Re-fetch cart count to update UI
            fetchCartCount();
            alert('Added to cart!');
        }
    } catch (error) {
        console.error("Error adding to cart", error);
    }
}

async function addToWishlist(productId) {
    const user = auth.getUser();
    if (!user) {
        window.location.href = '/login.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId })
        });

        if (response.status === 401) return auth.handleSessionTimeout();

        if (response.ok) {
            alert('Added to wishlist!');
        } else {
            const data = await response.json();
            alert(data.message || 'Error adding to wishlist');
        }
    } catch (error) {
        console.error("Error adding to wishlist", error);
    }
}

// --- UI Utils ---
function updateCartCountBadge(count) {
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.innerText = count;
    }
}

function renderProductCard(product) {
    return `
        <div class="product-card">
            <div class="product-img-wrapper">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="description">${product.description.substring(0, 50)}...</p>
                <div class="product-price">₹${product.price.toLocaleString('en-IN')}</div>
                <div style="display: flex; gap: 8px; margin-top: 15px;">
                    <button class="btn btn-primary add-to-cart-btn" style="flex: 1;" onclick="addToCart('${product.id}')">
                        <i class="fas fa-shopping-cart"></i> Add
                    </button>
                    <button class="btn btn-outline" style="padding: 10px;" onclick="addToWishlist('${product.id}')" title="Add to Wishlist">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// --- Page Specific Logic ---

// Homepage - Featured Products
async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products-container');
    if (!container) return; // Not on homepage

    const products = await fetchProducts();
    // Reverse the array to show newest additions first, then take the top 4
    const featured = products.reverse().slice(0, 4);
    container.innerHTML = featured.map(p => renderProductCard(p)).join('');
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }

    // Initial Data Fetches
    fetchCartCount();

    // Page Initializers
    loadFeaturedProducts();

    // Carousel Logic
    const initCarousel = () => {
        const slides = document.querySelectorAll('.carousel-slide');
        const indicators = document.querySelectorAll('.indicator');
        if (slides.length === 0) return; // Not on a page with a carousel

        let currentSlide = 0;
        const totalSlides = slides.length;
        let slideInterval;

        const showSlide = (index) => {
            slides.forEach(s => s.classList.remove('active'));
            indicators.forEach(i => i.classList.remove('active'));

            slides[index].classList.add('active');
            indicators[index].classList.add('active');
            currentSlide = index;
        };

        const nextSlide = () => {
            showSlide((currentSlide + 1) % totalSlides);
        };

        const startSlider = () => {
            if (slideInterval) clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000); // Change every 5 seconds
        };

        // Manual Navigation
        indicators.forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                showSlide(index);
                startSlider(); // Reset timer on manual click
            });
        });

        // Start automatic sliding
        startSlider();
    };

    initCarousel();
});
