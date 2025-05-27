// src/services/api.js - Real API calls only, no mock implementation
import axios from 'axios';

// Create an axios instance
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
        return response;
    },
    (error) => {
        console.log('🔍 API Interceptor: Error caught:', error.response?.status || 'Network Error');

        // Handle specific error codes
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    console.log('🔒 Unauthorized: Removing token and redirecting to login');
                    localStorage.removeItem('token');
                    // Only redirect if not already on login page
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    console.error('🚫 Forbidden: You do not have permission to access this resource');
                    break;
                case 404:
                    console.error('🔍 Not Found: Resource not found');
                    break;
                case 500:
                    console.error('🔧 Server Error: An error occurred on the server');
                    break;
                default:
                    console.error(`⚠️ Error ${status}:`, data?.message || error.message);
            }
        } else if (error.request) {
            console.error('🌐 Network Error: No response received from the server');
        } else {
            console.error('⚙️ Request Setup Error:', error.message);
        }

        return Promise.reject(error);
    }
);

// Real API proxy - all requests go to actual backend services
const api = {
    get: async (url, config) => {
        return axiosInstance.get(url, config);
    },

    post: async (url, data, config) => {
        return axiosInstance.post(url, data, config);
    },

    put: async (url, data, config) => {
        return axiosInstance.put(url, data, config);
    },

    delete: async (url, config) => {
        return axiosInstance.delete(url, config);
    },

    patch: async (url, data, config) => {
        return axiosInstance.patch(url, data, config);
    }
};

export default api;