// client/components/providers/ThemeProvider.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'sonner';

import { ThemeContext } from '@/context/ThemeContext';
import { getThemeOptions } from '../../lib/theme';

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // State to hold the current mode
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  // Check for saved preference in localStorage on initial load
  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as 'light' | 'dark' | null;
    if (savedMode) {
      setMode(savedMode);
    }
    setMounted(true);
  }, []);

  // The function to toggle the mode
  const toggleColorMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      // Save the new preference to localStorage
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  // useMemo ensures the theme is only recreated when the mode changes
  const theme = useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

  // The value to be passed to the context provider
  const themeContextValue = useMemo(
    () => ({
      mode,
      toggleColorMode,
      mounted,
    }),
    [mode, mounted]
  );

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <Toaster theme={mode} richColors position="bottom-right" />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
