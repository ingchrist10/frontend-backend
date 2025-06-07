#!/bin/bash

mkdir -p frontend-codes/lib

cat > frontend-codes/lib/authUtils.ts << 'EOL'
import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

// Create an axios instance for authenticated requests
export const axiosAuth = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add the token to every request
axiosAuth.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token refresh
axiosAuth.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${apiUrl}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        if (response.data.access) {
          // Store the new tokens
          localStorage.setItem('access_token', response.data.access);
          
          // Update the Authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return !!localStorage.getItem('access_token');
};

// Function to log out user
export const logout = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }
};
EOL

echo "Auth utilities file created successfully." 