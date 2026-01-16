/**
 * Auth Service - Production Ready with Real Firebase Auth
 * 
 * Features:
 * - Automatic Firebase ID token injection
 * - Token refresh handling
 * - Real user authentication
 */

import axios from 'axios';
import { Platform } from 'react-native';
import { auth } from '../lib/firebase';

/**
 * API Base URL Configuration
 */
const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000/api';
    }

    return 'http://localhost:3000/api';
};

const BASE_URL = getBaseUrl();
console.log('[AuthService] Using API URL:', BASE_URL);

// Initialize Axios instance
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to inject Firebase ID token
api.interceptors.request.use(
    async (config) => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);

        // Check if user is authenticated
        if (auth.currentUser) {
            try {
                // Get fresh Firebase ID token
                const idToken = await auth.currentUser.getIdToken();
                config.headers.Authorization = `Bearer ${idToken}`;
                console.log('[Auth] Injected Firebase ID token');
            } catch (error) {
                console.error('[Auth] Failed to get ID token:', error);
            }
        } else {
            console.warn('[Auth] No authenticated user, request may fail');
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

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