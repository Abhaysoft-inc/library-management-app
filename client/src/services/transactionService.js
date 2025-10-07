import api from './api';

const transactionService = {
    // Get user's transactions
    getUserTransactions: async () => {
        const response = await api.get('/transactions/user');
        return response;
    },

    // Request/Reserve a book
    requestBook: async (bookId) => {
        const response = await api.post('/transactions/request', { bookId });
        return response;
    },

    // Renew a book
    renewBook: async (transactionId) => {
        const response = await api.post(`/transactions/${transactionId}/renew`);
        return response;
    },

    // Get transaction details
    getTransactionDetails: async (transactionId) => {
        const response = await api.get(`/transactions/${transactionId}`);
        return response;
    },

    // Issue book (librarian only)
    issueBook: async (issueData) => {
        const response = await api.post('/transactions/issue', issueData);
        return response;
    },

    // Return book (librarian only)
    returnBook: async (transactionId, returnData) => {
        const response = await api.post(`/transactions/${transactionId}/return`, returnData);
        return response;
    },

    // Get overdue transactions (librarian only)
    getOverdueTransactions: async () => {
        const response = await api.get('/transactions/overdue');
        return response;
    },

    // Get all transactions (librarian only)
    getAllTransactions: async (params = {}) => {
        const response = await api.get('/transactions', { params });
        return response;
    },

    // Pay fine
    payFine: async (transactionId, paymentData) => {
        const response = await api.post(`/transactions/${transactionId}/pay-fine`, paymentData);
        return response;
    },

    // Get transaction statistics (librarian only)
    getTransactionStats: async () => {
        const response = await api.get('/transactions/stats');
        return response;
    },
};

export default transactionService;