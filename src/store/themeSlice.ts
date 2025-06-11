import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Theme } from '@mui/material';
import { lightTheme, darkTheme } from '../theme';

interface ThemeState {
  currentTheme: Theme;
  isDarkMode: boolean;
}

const initialState: ThemeState = {
  currentTheme: lightTheme,
  isDarkMode: false,
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.isDarkMode = !state.isDarkMode;
      state.currentTheme = state.isDarkMode ? darkTheme : lightTheme;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      state.currentTheme = action.payload ? darkTheme : lightTheme;
    },
  },
});

export const { toggleTheme, setDarkMode } = themeSlice.actions;
export default themeSlice.reducer;