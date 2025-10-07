import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import bookSlice from './slices/bookSlice';
import transactionSlice from './slices/transactionSlice';

export const store = configureStore({
    reducer: {
        auth: authSlice,
        books: bookSlice,
        transactions: transactionSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST'],
            },
        }),
});

// Export types for TypeScript (if needed later)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;