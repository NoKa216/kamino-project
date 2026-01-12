/**
 * Trips Service - Production Ready (2026 Standard)
 * 
 * Responsibilities:
 * - Trip generation API calls
 * - User trips retrieval
 * 
 * Architecture:
 * - Uses centralized Axios instance from auth.service.ts
 * - No duplicate URL configuration
 * - Consistent error handling
 */

import api from './auth.service';

export interface TripGenerationData {
    destination: string;
    startDate: string;
    endDate: string;
    travelers?: string;
    budget?: string;
    interests?: string[];
    mustHaveItems?: string[];
}

export interface GeneratedTrip {
    success?: boolean;
    tripId: string;
    trip?: any;
    candidates?: any[];
}

export const TripsService = {
    /**
     * Generate a new trip with AI-powered place recommendations
     */
    generateTrip: async (data: TripGenerationData, token?: string): Promise<GeneratedTrip> => {
        try {
            console.log('Generating trip with data:', data);

            // Set authorization header if token provided
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const response = await api.post<GeneratedTrip>('/trips/generate', data, config);
            return response.data;
        } catch (error) {
            console.error('Trip generation error:', error);
            throw error;
        }
    },

    /**
     * Fetch all trips for the current user
     */
    getUserTrips: async (token?: string): Promise<GeneratedTrip[]> => {
        try {
            // Set authorization header if token provided
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

            const response = await api.get<GeneratedTrip[]>('/trips', config);
            return response.data;
        } catch (error) {
            console.error('Error fetching trips:', error);
            return [];
        }
    }
};
