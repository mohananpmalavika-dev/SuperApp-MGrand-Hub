import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import educationReducer from './slices/educationSlice';
import progressReducer from './slices/progressSlice';
import tutorReducer from './slices/tutorSlice';
import paymentReducer from './slices/paymentSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    education: educationReducer,
    progress: progressReducer,
    tutor: tutorReducer,
    payment: paymentReducer,
    admin: adminReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
