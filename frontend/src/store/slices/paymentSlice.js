import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

// Create Razorpay order
export const createOrder = createAsyncThunk(
  'payment/createOrder',
  async ({ planId, amount }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/payments/create-order`, {
        planId,
        amount,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create order');
    }
  }
);

// Verify payment
export const verifyPayment = createAsyncThunk(
  'payment/verifyPayment',
  async (paymentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/payments/verify`, paymentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Payment verification failed');
    }
  }
);

// Get subscription details
export const getSubscription = createAsyncThunk(
  'payment/getSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/payments/subscription`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch subscription');
    }
  }
);

// Get payment history
export const getPaymentHistory = createAsyncThunk(
  'payment/getPaymentHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/api/payments/history`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch payment history');
    }
  }
);

// Cancel subscription
export const cancelSubscription = createAsyncThunk(
  'payment/cancelSubscription',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/api/payments/cancel-subscription`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to cancel subscription');
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    subscription: null,
    paymentHistory: [],
    currentOrder: null,
    loading: false,
    error: null,
    plans: [
      {
        id: 'monthly',
        name: 'Monthly Plan',
        price: 999,
        duration: '1 Month',
        features: [
          'Access to all 4 tracks (CA, IAS, JEE, School)',
          'Unlimited AI-generated lessons',
          'Unlimited practice questions',
          'AI-powered tutor (24/7)',
          'Text-to-speech lectures',
          'Animated problem solving',
          'Progress tracking & analytics',
          'Mock tests & assessments',
          'Download notes & materials',
          'Mobile app access',
        ],
        popular: false,
      },
      {
        id: 'quarterly',
        name: 'Quarterly Plan',
        price: 2499,
        duration: '3 Months',
        originalPrice: 2997,
        savings: 498,
        features: [
          'All Monthly Plan features',
          'Save ₹498 (17% off)',
          'Priority AI tutor support',
          'Advanced analytics',
          'Personalized study plans',
          'Weekly progress reports',
          'Doubt clearing sessions',
        ],
        popular: true,
      },
      {
        id: 'annual',
        name: 'Annual Plan',
        price: 7999,
        duration: '12 Months',
        originalPrice: 11988,
        savings: 3989,
        features: [
          'All Quarterly Plan features',
          'Save ₹3,989 (33% off)',
          'Lifetime access to completed courses',
          '1-on-1 mentorship calls (monthly)',
          'Exclusive study materials',
          'Career guidance sessions',
          'Certificate of completion',
          'Early access to new features',
        ],
        popular: false,
      },
    ],
  },
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Payment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload.subscription;
        state.currentOrder = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Subscription
      .addCase(getSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addCase(getSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Payment History
      .addCase(getPaymentHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentHistory = action.payload;
      })
      .addCase(getPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearPaymentError, clearCurrentOrder } = paymentSlice.actions;
export default paymentSlice.reducer;
