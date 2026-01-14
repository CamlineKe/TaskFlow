'use client'; // This component must be a client component

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'sonner';

import { lightTheme, darkTheme } from './theme';

// A helper component to bridge next-themes and MUI
function MuiBridge({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme === 'dark' ? darkTheme : lightTheme;
  
  return (
    <MuiThemeProvider theme={currentTheme}>
      {children}
      <Toaster 
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'} 
        position="bottom-right" 
      />
    </MuiThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance for each request
  const [queryClient] = useState(() => new QueryClient());

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark" // Our default theme
      enableSystem={false}
    >
      <MuiBridge>
        {/* CssBaseline kickstarts an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <QueryClientProvider client={queryClient}>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </QueryClientProvider>
      </MuiBridge>
    </NextThemesProvider>
  );
}
