import axios from 'axios';
import { Platform } from 'react-native';

/**
 * API Base URL Configuration
 * * Note regarding 'localhost':
 * - iOS Simulator: Can access 'localhost' directly.
 * - Android Emulator: 'localhost' refers to the device itself. Use '10.0.2.2' to reach the host machine.
 * - Physical Device: Must use your computer's local LAN IP (e.g., http://192.168.1.15:3000).
 */
const BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:3000/api'      // Added '/api' prefix
    : 'http://localhost:3000/api';    // Added '/api' prefix

// Initialize Axios instance with default configuration
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Optional: Add request interceptor for debugging network calls
api.interceptors.request.use(request => {
    console.log(`[API Request] ${request.method?.toUpperCase()} ${request.url}`);
    return request;
});

export const authService = {
    /**
     * Registers a new user with email and password.
     * @param data - The user registration payload (email, password, fullName).
     */
    signup: async (data: any) => {
        return api.post('/auth/signup', data);
    },

    /**
     * Verifies the Firebase ID Token with the backend to complete login.
     * @param idToken - The Firebase ID Token received from the client SDK.
     */
    login: async (idToken: string) => {
        return api.post('/auth/login', { idToken });
    },

    /**
     * Handles authentication via social providers (Google, Apple).
     * @param idToken - The Firebase ID Token.
     * @param fullName - Optional name from the social provider.
     */
    socialAuth: async (idToken: string, fullName?: string) => {
        return api.post('/auth/social', { idToken, fullName });
    },

    /**
     * Handles anonymous (guest) authentication.
     * @param idToken - The Firebase ID Token for the anonymous user.
     */
    anonymousAuth: async (idToken: string) => {
        return api.post('/auth/anonymous', { idToken });
    }
};

export default api;