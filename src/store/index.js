import { configureStore } from '@reduxjs/toolkit';
import userManagementReducer from './slices/userManagementSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    userManagement: userManagementReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
