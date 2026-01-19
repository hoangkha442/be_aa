import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import advisorReducer from './slices/advisorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    advisor: advisorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
