import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import navigationReducer from './slices/navigationSlice'; // ✅ Ajout

export const store = configureStore({
  reducer: {
    auth: authReducer,
    navigation: navigationReducer, // ✅ Ajout
  },
});