import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export interface Job {
  id: string;
  title: {
    en: string;
    hi: string;
  };
  description: {
    en: string;
    hi: string;
  };
  department: string;
  startDate: string;
  endDate: string;
  category: string;
  eligibility: string;
  salary: string;
  location: string;
  vacancies: number;
  applicationUrl: string;
  status: 'active' | 'closed' | 'upcoming';
}

interface JobsState {
  items: Job[];
  loading: boolean;
  error: string | null;
  filters: {
    category: string;
    department: string;
    status: string;
  };
}

const initialState: JobsState = {
  items: [],
  loading: false,
  error: null,
  filters: {
    category: '',
    department: '',
    status: '',
  },
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/jobs`);
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch jobs');
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<{ key: keyof JobsState['filters']; value: string }>) => {
      const { key, value } = action.payload;
      state.filters[key] = value;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<Job[]>) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilter, clearFilters } = jobsSlice.actions;
export default jobsSlice.reducer;