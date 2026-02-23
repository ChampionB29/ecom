// auth.js - Core authentication logic and state management
const API_URL = '/api';

class AuthService {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.updateNavUI();
    }

    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.setCurrentUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login.' };
        }
    }

    async signup(name, email, password) {
        try {
            const response = await fetch(`${API_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                this.setCurrentUser(data.user);
                return { success: true, user: data.user };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, message: 'An error occurred during signup.' };
        }
    }

    async logout() {
        try {
            await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
        } catch (e) {
            console.error(e);
        }
        this.user = null;
        localStorage.removeItem('user');
        this.updateNavUI();
        window.location.href = '/login.html'; // redirect to login
    }

    setCurrentUser(user) {
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        this.updateNavUI();
    }

    getUser() {
        return this.user;
    }

    handleSessionTimeout() {
        alert("Your session has expired. Please log in again.");
        this.logout();
    }

    updateNavUI() {
        // Runs across all pages where nav and auth.js exists
        const authLinksContainer = document.getElementById('auth-links');
        if (!authLinksContainer) return;

        if (this.user) {
            authLinksContainer.innerHTML = `
                <a href="/wishlist.html" style="margin-right: 15px;"><i class="fas fa-heart"></i> Wishlist</a>
                <a href="/orders.html" style="margin-right: 15px;"><i class="fas fa-box"></i> Orders</a>
                <a href="/settings.html" style="margin-right: 15px;"><i class="fas fa-cog"></i> Settings</a>
                <span style="font-size: 0.9rem; color: var(--text-secondary)">Hi, ${this.user.name}</span>
                <button class="btn btn-outline" onclick="auth.logout()" style="padding: 6px 12px; font-size: 0.8rem; margin-left: 10px;">Logout</button>
            `;
        } else {
            authLinksContainer.innerHTML = `
                <a href="/login.html">Login</a>
                <a href="/signup.html" class="btn btn-primary">Sign Up</a>
            `;
        }
    }
}

// Global available instance
const auth = new AuthService();
