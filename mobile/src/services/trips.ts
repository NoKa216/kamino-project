/**
 * Trips Service - Production Ready (2026 Standard)
 * * Responsibilities:
 * - Trip generation API calls
 * - User trips retrieval
 * - Trip resume functionality
 * - Real-time swipe persistence
 * * Architecture:
 * - Uses centralized Axios instance from auth.service.ts
 * - Implements Smart Deduplication to prevent double-refreshes
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
    logistics?: {
        hasBookedFlights: boolean;
        flightDetails?: {
            arrivalTime?: string;   // "HH:mm"
            departureTime?: string; // "HH:mm"
            flightNumber?: string;
        };
        hasBookedAccommodation: boolean;
        accommodationDetails?: {
            hotelName?: string;
            location?: string;
        };
    };
}

export interface GeneratedTrip {
    success?: boolean;
    id?: string;        // Firestore document ID
    tripId?: string;    // Legacy support
    trip?: any;
    candidates?: any[];
    destination?: string;
    startDate?: string;
    endDate?: string;
    heroImage?: string; // Curated destination image URL
    status?: string;
    // NEW LEAN SCHEMA (preferred)
    swipedLikeIds?: string[];
    swipedDislikeIds?: string[];
    // OLD SCHEMA (backward compatibility)
    swipedLikes?: any[];
    swipedDislikes?: any[];
}

// In-memory cache for instant UI on screen remount
let tripsCache: GeneratedTrip[] = [];

// --- DEDUPLICATION STATE ---
// Timestamp of the last successful fetch
let lastFetchTime = 0;
// Minimum time between background fetches (5 seconds)
const CACHE_TTL = 5000;

export const TripsService = {
    /**
     * Generate a new trip with AI-powered place recommendations
     */
    generateTrip: async (data: TripGenerationData, token?: string): Promise<GeneratedTrip> => {
        try {
            console.log('Generating trip with data:', data);

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
     * Implements "Smart Deduplication": Returns cached data if fetched recently (<5s)
     * unless forceRefresh is true.
     */
    getUserTrips: async (forceRefresh = false, token?: string): Promise<GeneratedTrip[]> => {
        try {
            const now = Date.now();

            // Deduplication logic: If we have cache, data is fresh (<5s), and not forced -> Return cache
            if (!forceRefresh && tripsCache.length > 0 && (now - lastFetchTime < CACHE_TTL)) {
                console.log('[TripsService] Skipping fetch (Deduped)');
                return tripsCache;
            }

            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await api.get<GeneratedTrip[]>('/trips', config);

            // Update cache and timestamp on success
            tripsCache = response.data;
            lastFetchTime = Date.now();

            return response.data;
        } catch (error) {
            console.error('Error fetching trips:', error);
            // On error, return cached data if available
            if (tripsCache.length > 0) return tripsCache;
            return [];
        }
    },

    /**
     * Get cached upcoming or active trip synchronously (for instant UI)
     * Returns null if no trips are ongoing or in the future
     * Logic: Shows any trip where endDate >= today (adventure not over yet)
     */
    getCachedUpcomingTrip: (): GeneratedTrip | null => {
        if (tripsCache.length === 0) return null;

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        // Filter for active or future trips (endDate >= today means trip not over)
        const activeOrFutureTrips = tripsCache.filter(trip => {
            if (!trip.endDate) return false;
            const endDate = new Date(trip.endDate).getTime();
            return endDate >= today;
        });

        if (activeOrFutureTrips.length === 0) return null;

        // Sort by closest start date (active trips first, then upcoming)
        activeOrFutureTrips.sort((a, b) => {
            const dateA = new Date(a.startDate!).getTime();
            const dateB = new Date(b.startDate!).getTime();
            return dateA - dateB;
        });

        return activeOrFutureTrips[0];
    },

    /**
     * Check if we have cached trips
     * Helper to determine if we should show a skeleton loader
     */
    hasCachedData: (): boolean => {
        return tripsCache.length > 0;
    },

    /**
     * Invalidate cache to force fresh fetch on next getUserTrips call
     * Call this after creating/updating/deleting a trip
     */
    invalidateCache: (): void => {
        lastFetchTime = 0; // Reset timestamp to force next fetch
        console.log('[TripsService] Cache invalidated');
    },

    /**
     * Get a single trip by ID (for resume functionality)
     */
    getTripById: async (tripId: string, token?: string): Promise<GeneratedTrip | null> => {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await api.get<GeneratedTrip>(`/trips/${tripId}`, config);
            return response.data;
        } catch (error) {
            console.error('Error fetching trip:', error);
            return null;
        }
    },

    /**
     * Record swipe action (fire-and-forget, doesn't block UI)
     */
    recordSwipe: async (tripId: string, place: any, direction: 'like' | 'dislike', token?: string): Promise<void> => {
        try {
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            // Fire-and-forget: don't await
            api.post(`/trips/${tripId}/swipe`, { place, direction }, config).catch(err => {
                console.warn('[Swipe] Failed to persist:', err);
            });
        } catch (error) {
            // Silently fail - swipe persistence is not critical for UX
            console.warn('[Swipe] Error:', error);
        }
    },

    /**
     * Build itinerary from liked places using AI
     * Calls the backend which triggers Gemini AI to generate a day-by-day schedule
     */
    buildItinerary: async (tripId: string, token?: string): Promise<any> => {
        try {
            console.log('[TripsService] Building itinerary for trip:', tripId);
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            const response = await api.post(`/trips/${tripId}/build-itinerary`, {}, config);
            console.log('[TripsService] Itinerary built successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('[TripsService] Error building itinerary:', error);
            throw error;
        }
    }
};