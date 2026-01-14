'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

// Define the shape of the context value
export interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleColorMode: () => void;
  mounted: boolean;
}

// Create the context with a default value
export const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleColorMode: () => {
    console.error('toggleColorMode function not implemented');
  },
  mounted: false,
});

// Custom hook that bridges next-themes with our context
export const useThemeContext = (): ThemeContextType => {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleColorMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return {
    mode: (resolvedTheme as 'light' | 'dark') || 'dark',
    toggleColorMode,
    mounted,
  };
};
