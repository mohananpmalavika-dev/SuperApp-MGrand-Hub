import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_TUTOR_SERVICE_URL || 'http://localhost:3013';

// Async thunks
export const sendTutorMessage = createAsyncThunk(
  'tutor/sendMessage',
  async ({ message, image }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const formData = new FormData();
      formData.append('message', message);
      if (image) {
        formData.append('image', image);
      }
      
      const response = await axios.post(
        `${API_URL}/tutor/ask`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  'tutor/fetchChatHistory',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/tutor/history`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat history');
    }
  }
);

const initialState = {
  messages: [],
  loading: false,
  error: null,
  typing: false,
};

const tutorSlice = createSlice({
  name: 'tutor',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setTyping: (state, action) => {
      state.typing = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendTutorMessage.pending, (state) => {
        state.loading = true;
        state.typing = true;
        state.error = null;
      })
      .addCase(sendTutorMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.typing = false;
        if (action.payload.response) {
          state.messages.push({
            role: 'assistant',
            content: action.payload.response,
            timestamp: new Date().toISOString(),
          });
        }
      })
      .addCase(sendTutorMessage.rejected, (state, action) => {
        state.loading = false;
        state.typing = false;
        state.error = action.payload;
      })
      
      // Fetch chat history
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages || action.payload;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { addMessage, setTyping, clearMessages } = tutorSlice.actions;
export default tutorSlice.reducer;
