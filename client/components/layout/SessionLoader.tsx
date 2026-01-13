// client/components/layout/SessionLoader.tsx
'use client';

import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useAuthStore } from '@/store/auth.store';
import apiClient from '@/lib/axios';

// This component will wrap our entire authenticated app layout.
export function SessionLoader({ children }: { children: React.ReactNode }) {
  const { user, setUser, logout, token } = useAuthStore();
  // We use a local loading state to show a spinner while we verify the token.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      // Get the token from the Zustand store (which gets it from localStorage).
      const storedToken = useAuthStore.getState().token;

      if (!storedToken) {
        // If there's no token, no need to do anything.
        setIsLoading(false);
        return;
      }

      try {
        // Use our apiClient, which will automatically have the Bearer token header.
        const { data: userData } = await apiClient.get('/auth/me');
        // If the request is successful, the token is valid. Set the user in the store.
        setUser(userData, storedToken);
      } catch (error) {
        // If the request fails (e.g., token expired), log the user out.
        console.error('Session verification failed:', error);
        logout();
      } finally {
        // In any case, stop loading.
        setIsLoading(false);
      }
    };

    // If we have a token but no user object, it means the page has been refreshed.
    // We need to verify the token and fetch the user data.
    if (token && !user) {
      verifyUser();
    } else {
      // If there's no token, or if we already have the user object, we don't need to load.
      setIsLoading(false);
    }
  }, [token, user, setUser, logout]);

  if (isLoading) {
    // While we are verifying the session, show a full-screen loading spinner.
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Once loading is false, show the actual application content.
  return <>{children}</>;
}
