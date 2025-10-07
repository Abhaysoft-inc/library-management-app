import api from './api';

const bookService = {
    // Get all books with pagination and filters
    getAllBooks: async (params = {}) => {
        const response = await api.get('/books', { params });
        return response;
    },

    // Search books
    searchBooks: async (query, filters = {}) => {
        const response = await api.get('/books/search', {
            params: { q: query, ...filters }
        });
        return response;
    },

    // Get book by ID
    getBookById: async (bookId) => {
        const response = await api.get(`/books/${bookId}`);
        return response;
    },

    // Add new book (librarian/admin only)
    addBook: async (bookData) => {
        const response = await api.post('/books', bookData);
        return response;
    },

    // Update book (librarian/admin only)
    updateBook: async (bookId, bookData) => {
        const response = await api.put(`/books/${bookId}`, bookData);
        return response;
    },

    // Delete book (librarian/admin only)
    deleteBook: async (bookId) => {
        const response = await api.delete(`/books/${bookId}`);
        return response;
    },

    // Get book categories
    getCategories: async () => {
        const response = await api.get('/books/categories');
        return response;
    },

    // Get popular books
    getPopularBooks: async (limit = 10) => {
        const response = await api.get(`/books/popular?limit=${limit}`);
        return response;
    },

    // Add book review
    addReview: async (bookId, reviewData) => {
        const response = await api.post(`/books/${bookId}/reviews`, reviewData);
        return response;
    },

    // Get book availability
    checkAvailability: async (bookId) => {
        const response = await api.get(`/books/${bookId}/availability`);
        return response;
    },
};

export default bookService;