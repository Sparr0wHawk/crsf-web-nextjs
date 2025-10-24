/**
 * HTTP Client - Axios instance with interceptors
 * 
 * Handles:
 * - Base URL configuration
 * - Authentication headers
 * - Error handling
 * - Request/Response logging
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

// ============================================================================
// Configuration
// ============================================================================

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// Request Interceptor
// ============================================================================

httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// Response Interceptor
// ============================================================================

httpClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      });
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          console.error('❌ 401 Unauthorized - Redirecting to login');
          localStorage.removeItem('auth_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden - user doesn't have permission
          console.error('❌ 403 Forbidden - Access denied');
          break;

        case 404:
          // Not found
          console.error('❌ 404 Not Found:', error.config?.url);
          break;

        case 500:
          // Server error
          console.error('❌ 500 Internal Server Error');
          break;

        default:
          console.error(`❌ API Error (${status}):`, data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ Network Error: No response from server');
    } else {
      // Error in request setup
      console.error('❌ Request Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default httpClient;
