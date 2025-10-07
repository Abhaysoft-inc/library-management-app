import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bookService from '../../services/bookService';

// Async thunk for getting all books
export const getAllBooks = createAsyncThunk(
    'books/getAllBooks',
    async (params, { rejectWithValue }) => {
        try {
            const response = await bookService.getAllBooks(params);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch books');
        }
    }
);

// Async thunk for searching books
export const searchBooks = createAsyncThunk(
    'books/searchBooks',
    async (searchQuery, { rejectWithValue }) => {
        try {
            const response = await bookService.searchBooks(searchQuery);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Search failed');
        }
    }
);

// Async thunk for getting book details
export const getBookDetails = createAsyncThunk(
    'books/getBookDetails',
    async (bookId, { rejectWithValue }) => {
        try {
            const response = await bookService.getBookById(bookId);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch book details');
        }
    }
);

const initialState = {
    books: [],
    currentBook: null,
    isLoading: false,
    error: null,
    searchResults: [],
    filters: {
        category: '',
        author: '',
        availableOnly: false,
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalBooks: 0,
    },
};

const bookSlice = createSlice({
    name: 'books',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = {
                category: '',
                author: '',
                availableOnly: false,
            };
        },
        clearSearchResults: (state) => {
            state.searchResults = [];
        },
        setCurrentPage: (state, action) => {
            state.pagination.currentPage = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get all books cases
            .addCase(getAllBooks.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getAllBooks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.books = action.payload.data.books;
                state.pagination = action.payload.data.pagination;
            })
            .addCase(getAllBooks.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Search books cases
            .addCase(searchBooks.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(searchBooks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.searchResults = action.payload.data.books;
            })
            .addCase(searchBooks.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Get book details cases
            .addCase(getBookDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getBookDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentBook = action.payload.data.book;
            })
            .addCase(getBookDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { clearError, setFilters, clearFilters, clearSearchResults, setCurrentPage } = bookSlice.actions;

export default bookSlice.reducer;