import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './themeSlice';
import jobsReducer from './jobsSlice';
import admissionsReducer from './admissionsSlice';
import resultsReducer from './resultsSlice';

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    jobs: jobsReducer,
    admissions: admissionsReducer,
    results: resultsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;