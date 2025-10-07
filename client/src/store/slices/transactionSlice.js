import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import transactionService from '../../services/transactionService';

// Async thunk for getting user transactions
export const getUserTransactions = createAsyncThunk(
    'transactions/getUserTransactions',
    async (_, { rejectWithValue }) => {
        try {
            const response = await transactionService.getUserTransactions();
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
        }
    }
);

// Async thunk for requesting book
export const requestBook = createAsyncThunk(
    'transactions/requestBook',
    async (bookId, { rejectWithValue }) => {
        try {
            const response = await transactionService.requestBook(bookId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to request book');
        }
    }
);

// Async thunk for renewing book
export const renewBook = createAsyncThunk(
    'transactions/renewBook',
    async (transactionId, { rejectWithValue }) => {
        try {
            const response = await transactionService.renewBook(transactionId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to renew book');
        }
    }
);

const initialState = {
    transactions: [],
    activeTransactions: [],
    borrowingHistory: [],
    isLoading: false,
    error: null,
    stats: {
        totalBorrowed: 0,
        currentlyBorrowed: 0,
        overdueBooks: 0,
        totalFines: 0,
    },
};

const transactionSlice = createSlice({
    name: 'transactions',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateTransactionStatus: (state, action) => {
            const { transactionId, status } = action.payload;
            const transaction = state.transactions.find(t => t._id === transactionId);
            if (transaction) {
                transaction.status = status;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Get user transactions cases
            .addCase(getUserTransactions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getUserTransactions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.transactions = action.payload.data.transactions;
                state.activeTransactions = action.payload.data.active;
                state.borrowingHistory = action.payload.data.history;
                state.stats = action.payload.data.stats;
            })
            .addCase(getUserTransactions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Request book cases
            .addCase(requestBook.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(requestBook.fulfilled, (state, action) => {
                state.isLoading = false;
                // Add new transaction to active transactions
                state.activeTransactions.push(action.payload.data.transaction);
            })
            .addCase(requestBook.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Renew book cases
            .addCase(renewBook.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(renewBook.fulfilled, (state, action) => {
                state.isLoading = false;
                // Update the transaction in active transactions
                const updatedTransaction = action.payload.data.transaction;
                const index = state.activeTransactions.findIndex(t => t._id === updatedTransaction._id);
                if (index !== -1) {
                    state.activeTransactions[index] = updatedTransaction;
                }
            })
            .addCase(renewBook.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, updateTransactionStatus } = transactionSlice.actions;

export default transactionSlice.reducer;