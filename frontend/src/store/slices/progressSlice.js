import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const configuredApiUrl = process.env.REACT_APP_EDUCATION_SERVICE_URL || 'http://localhost:3013';
const API_URL = configuredApiUrl.endsWith('/api/education')
  ? configuredApiUrl
  : `${configuredApiUrl.replace(/\/$/, '')}/api/education`;

// Async thunks
export const fetchProgress = createAsyncThunk(
  'progress/fetchProgress',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/progress`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch progress');
    }
  }
);

export const fetchStudyPlan = createAsyncThunk(
  'progress/fetchStudyPlan',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get(`${API_URL}/progress/study-plan`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch study plan');
    }
  }
);

export const updateLessonProgress = createAsyncThunk(
  'progress/updateLessonProgress',
  async ({ lessonId, completed, timeSpent }, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post(
        `${API_URL}/progress/lessons/${lessonId}`,
        { completed, timeSpent },
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update progress');
    }
  }
);

const initialState = {
  userProgress: null,
  studyPlan: null,
  stats: {
    coursesEnrolled: 0,
    lessonsCompleted: 0,
    questionsAttempted: 0,
    testsCompleted: 0,
    currentStreak: 0,
    totalTimeSpent: 0,
  },
  loading: false,
  error: null,
};

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    clearProgress: (state) => {
      state.userProgress = null;
      state.studyPlan = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch progress
      .addCase(fetchProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.userProgress = action.payload.progress || action.payload;
        if (action.payload.stats) {
          state.stats = action.payload.stats;
        }
      })
      .addCase(fetchProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch study plan
      .addCase(fetchStudyPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudyPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.studyPlan = action.payload.studyPlan || action.payload;
      })
      .addCase(fetchStudyPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update lesson progress
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        if (action.payload.progress) {
          state.userProgress = action.payload.progress;
        }
      });
  },
});

export const { clearProgress } = progressSlice.actions;
export default progressSlice.reducer;
