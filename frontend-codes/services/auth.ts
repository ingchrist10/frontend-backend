import axios from 'axios';
import { SignupFormData, LoginFormData } from '@/lib/validations';
import authWebSocketService from '@/services/auth-websocket';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const USE_WEBSOCKET = process.env.NEXT_PUBLIC_USE_WEBSOCKET === 'true';

// Sign up user - can use either REST API or WebSocket
export const signupUser = async (data: SignupFormData) => {
  if (USE_WEBSOCKET) {
    try {
      await authWebSocketService.connect();
      const response = await authWebSocketService.signUp(data.email, data.password);
      authWebSocketService.disconnect();
      
      if (response.status === 'error') {
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (err: any) {
      throw new Error(err.message || 'An unknown error occurred');
    }
  } else {
    try {
      const response = await axios.post(`${apiUrl}/auth/register/`, data);
      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error(err.message || 'An unknown error occurred');
    }
  }
};

// Sign in user - can use either REST API or WebSocket
export const signinUser = async (data: LoginFormData) => {
  if (USE_WEBSOCKET) {
    try {
      await authWebSocketService.connect();
      const response = await authWebSocketService.signIn(data.email, data.password);
      authWebSocketService.disconnect();
      
      if (response.status === 'error') {
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (err: any) {
      throw new Error(err.message || 'An unknown error occurred');
    }
  } else {
    try {
      const response = await axios.post(`${apiUrl}/auth/token/`, {
        email: data.email,
        password: data.password
      });
      return response.data;
    } catch (err: any) {
      if (err.response && err.response.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error(err.message || 'An unknown error occurred');
    }
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No access token available');
    }
    
    const response = await axios.get(`${apiUrl}/auth/protected/`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return response.data;
  } catch (err: any) {
    if (err.response && err.response.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error(err.message || 'An unknown error occurred');
  }
};

// Refresh token
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await axios.post(`${apiUrl}/auth/token/refresh/`, {
      refresh: refreshToken
    });
    
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      return response.data;
    }
    
    throw new Error('Failed to refresh token');
  } catch (err: any) {
    if (err.response && err.response.data?.message) {
      throw new Error(err.response.data.message);
    }
    throw new Error(err.message || 'An unknown error occurred');
  }
};