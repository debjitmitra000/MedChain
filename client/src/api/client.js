// frontend/src/api/client.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL || '';

export const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 second timeout
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for consistent error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    
    // Transform error for consistent handling
    const transformedError = new Error(
      error.response?.data?.error || 
      error.response?.data?.message || 
      error.message || 
      'Network error occurred'
    );
    transformedError.status = error.response?.status;
    transformedError.data = error.response?.data;
    
    return Promise.reject(transformedError);
  }
);

export const get = (url, config) => api.get(url, config).then(r => r.data);
export const post = (url, data, config) => api.post(url, data, config).then(r => r.data);
