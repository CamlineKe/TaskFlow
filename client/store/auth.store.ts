import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Define the shape of the user object we expect from the API
interface User {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Define the shape of the store's state
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User, token?: string) => void;
  updateUser: (userData: Partial<User>) => void;
  logout: () => void;
}

// Create the Zustand store
export const useAuthStore = create<AuthState>()(
  // Use the 'persist' middleware to save the state to localStorage
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user, token) =>
        set((state) => ({
          user,
          token: token || state.token,
          isAuthenticated: true,
        })),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage', // The key to use for localStorage
    }
  )
);

// Export the User interface for use in other components
export type { User };
