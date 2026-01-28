import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gmailReducer from './slices/gmailSlice';
import emailsReducer from './slices/emailsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    gmail: gmailReducer,
    emails: emailsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
