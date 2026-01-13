import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

// Create the Axios instance with the base URL for our backend
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
} );

// Use an interceptor to add the auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    // Get the token from our Zustand store
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
