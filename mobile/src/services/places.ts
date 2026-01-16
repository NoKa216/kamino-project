import axios from 'axios';
import { Platform } from 'react-native';

/**
 * Determines the API base URL based on the runtime environment.
 * Priority:
 * 1. Environment variable (EXPO_PUBLIC_API_URL).
 * 2. Android Emulator localhost (10.0.2.2).
 * 3. Default localhost (iOS Simulator / Web).
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

export interface PlaceResult {
    placeId: string;
    description: string;   // Full description (e.g., "Paris, France")
    mainText: string;      // Main highlight (e.g., "Paris")
    secondaryText: string; // Subtitle (e.g., "France")
}

export const PlacesService = {
    /**
     * Searches for places or attractions via the backend API.
     * @param query - The search text input.
     * @param type - The type of place to search (e.g., 'city', 'attraction', 'lodging').
     */
    searchPlaces: async (query: string, type: string = 'city'): Promise<PlaceResult[]> => {
        if (!query || query.trim().length < 2) return [];

        try {
            const response = await axios.get(`${BASE_URL}/places/search`, {
                params: {
                    q: query,
                    type: type
                }
            });
            return response.data;
        } catch (error) {
            console.error('[PlacesService] Search request failed:', error);
            return [];
        }
    }
};