import axios from 'axios';
import { Platform } from 'react-native';

/**
 * API Base URL Configuration
 * Now uses the Environment Variable defined in .env file (EXPO_PUBLIC_API_URL).
 * Fallbacks are kept just in case the env var is missing.
 */
const getBaseUrl = () => {
    // 1. Priority: Check if the ENV variable exists
    if (process.env.EXPO_PUBLIC_API_URL) {
        // Ensure we don't double-slash the /api part if it's already in the env
        const url = process.env.EXPO_PUBLIC_API_URL;
        return url;
    }

    // 2. Fallback: Old logic (Simulators only)
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000/api';
    }

    // Fallback for iOS Simulator (won't work on physical device without Env var)
    return 'http://localhost:3000/api';
};

const BASE_URL = getBaseUrl();

console.log('[AuthService] Using API URL:', BASE_URL); // Log to confirm it's using the IP

// Initialize Axios instance
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor for debugging
api.interceptors.request.use(request => {
    console.log(`[API Request] ${request.method?.toUpperCase()} ${request.url}`);
    return request;
});

export const authService = {
    signup: async (data: any) => {
        return api.post('/auth/signup', data);
    },

    login: async (idToken: string) => {
        return api.post('/auth/login', { idToken });
    },

    socialAuth: async (idToken: string, fullName?: string) => {
        return api.post('/auth/social', { idToken, fullName });
    },

    anonymousAuth: async (idToken: string) => {
        return api.post('/auth/anonymous', { idToken });
    }
};

export default api;