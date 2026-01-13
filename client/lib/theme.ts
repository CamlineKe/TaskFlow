import { createTheme, ThemeOptions } from '@mui/material/styles';

// Define the shared theme options that are common to both light and dark modes
const sharedThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 8, // A modern, slightly rounded corner
  },
};

// Create the light theme by merging shared options with light-specific colors
export const lightTheme = createTheme({
  ...sharedThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#6366F1', // A nice indigo
    },
    secondary: {
      main: '#EC4899', // A vibrant pink
    },
    background: {
      default: '#F9FAFB', // A very light gray
      paper: '#FFFFFF',
    },
  },
});

// Create the dark theme by merging shared options with dark-specific colors
export const darkTheme = createTheme({
  ...sharedThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#818CF8', // A lighter indigo for dark mode contrast
    },
    secondary: {
      main: '#F472B6', // A lighter pink
    },
    background: {
      default: '#111827', // A deep, cool gray
      paper: '#1F2937',   // A slightly lighter gray for cards and surfaces
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
    },
  },
});

// Returns the theme options based on the mode
export function getThemeOptions(mode: 'light' | 'dark'): ThemeOptions {
  return mode === 'light'
    ? {
        ...sharedThemeOptions,
        palette: lightTheme.palette,
      }
    : {
        ...sharedThemeOptions,
        palette: darkTheme.palette,
      };
}
