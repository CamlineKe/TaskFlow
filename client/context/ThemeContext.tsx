'use client';

import { createContext, useContext } from 'react';
import { useTheme } from 'next-themes';

// Define the shape of the context value
export interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
}

// Create the context with a default value
export const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleColorMode: () => {
    console.error('toggleColorMode function not implemented');
  },
});

// Custom hook that bridges next-themes with our context
export const useThemeContext = (): ThemeContextType => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  
  const toggleColorMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return {
    mode: (resolvedTheme as 'light' | 'dark') || 'dark',
    toggleColorMode,
  };
};
