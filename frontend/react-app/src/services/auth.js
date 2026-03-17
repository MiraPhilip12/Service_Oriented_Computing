import api from './api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const authService = {
    // Register new user
    async register(userData) {
        const response = await api.post('/users/register', userData);
        if (response.data.token) {
            localStorage.setItem(TOKEN_KEY, response.data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Login user
    async login(credentials) {
        const response = await api.post('/users/login', credentials);
        if (response.data.token) {
            localStorage.setItem(TOKEN_KEY, response.data.token);
            localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Logout user
    logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem(USER_KEY);
        if (userStr) {
            return JSON.parse(userStr);
        }
        return null;
    },

    // Get token
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem(TOKEN_KEY);
    },

    // Update user profile
    async updateProfile(userData) {
        const response = await api.put('/users/profile', userData);
        if (response.data.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
        }
        return response.data;
    }
};

export default authService;