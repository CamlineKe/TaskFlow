import axios, { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth.store';

// Create the Axios instance with the base URL for our backend
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// DEBUG INTERCEPTOR - ADD THIS
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('🔍 AXIOS DEBUG START ==============');
    console.log('Base URL from config:', config.baseURL);
    console.log('Request URL from config:', config.url);
    
    // Type-safe way to log the full URL
    const baseURL = config.baseURL || '';
    const requestURL = config.url || '';
    console.log('Full calculated URL:', baseURL + requestURL);
    
    console.log('NEXT_PUBLIC_API_URL env variable:', process.env.NEXT_PUBLIC_API_URL);
    console.log('Environment (dev/prod):', process.env.NODE_ENV);
    console.log('🔍 AXIOS DEBUG END ================');
    return config;
  },
  (error) => {
    console.error('🔍 AXIOS DEBUG - Request error:', error);
    return Promise.reject(error);
  }
);

// Use an interceptor to add the auth token to every request (this runs AFTER debug)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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