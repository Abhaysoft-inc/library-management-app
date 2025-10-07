import api from './api';

const authService = {
    // Login user
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response;
    },

    // Register student
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response;
    },

    // Get current user
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response;
    },

    // Logout user
    logout: async () => {
        const response = await api.post('/auth/logout');
        return response;
    },

    // Change password
    changePassword: async (passwordData) => {
        const response = await api.post('/auth/change-password', passwordData);
        return response;
    },

    // Register librarian (admin only)
    registerLibrarian: async (librarianData) => {
        const response = await api.post('/auth/librarian-register', librarianData);
        return response;
    },
};

export default authService;