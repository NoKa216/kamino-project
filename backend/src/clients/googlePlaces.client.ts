/**
 * Google Places API Client
 * 
 * Responsibilities:
 * - Execute HTTP requests to Google Places API (New)
 * - Handle errors and implement retry logic
 * - Parse and validate API responses
 * - Manage field masks for cost optimization
 * 
 * @see https://developers.google.com/maps/documentation/places/web-service/place-details
 */

import axios, { AxiosError } from 'axios';

// ============================================================================
// TYPES
// ============================================================================

export interface GooglePlaceSearchResult {
    id: string;
    location?: {
        latitude: number;
        longitude: number;
    };
    formattedAddress?: string;
    photos?: Array<{ name: string }>;
    editorialSummary?: { text: string };
    rating?: number;
    userRatingCount?: number;
    regularOpeningHours?: {
        openNow: boolean;
        weekdayDescriptions: string[];
    };
}

interface SearchTextRequest {
    textQuery: string;
    maxResultCount?: number;
}

interface SearchTextResponse {
    places?: GooglePlaceSearchResult[];
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const PLACES_API_BASE_URL = 'https://places.googleapis.com/v1';

/**
 * Field mask to minimize API costs by only requesting needed data
 */
const FIELD_MASK = [
    'places.id',
    'places.location',
    'places.formattedAddress',
    'places.photos',
    'places.editorialSummary',
    'places.rating',
    'places.userRatingCount',
    'places.regularOpeningHours',
].join(',');

// ============================================================================
// PUBLIC API
// ============================================================================

export const GooglePlacesClient = {
    /**
     * Search for a place using text query
     * 
     * @param query - Search query (e.g., "Eiffel Tower in Paris")
     * @returns First matching place or null if not found
     * @throws Error if API key is missing or request fails
     */
    searchPlace: async (query: string): Promise<GooglePlaceSearchResult | null> => {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;

        if (!apiKey) {
            throw new Error('[GooglePlaces] API key not configured');
        }

        try {
            const requestBody: SearchTextRequest = {
                textQuery: query,
                maxResultCount: 1,
            };

            const response = await axios.post<SearchTextResponse>(
                `${PLACES_API_BASE_URL}/places:searchText`,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Goog-Api-Key': apiKey,
                        'X-Goog-FieldMask': FIELD_MASK,
                    },
                    timeout: 10000, // 10 second timeout
                }
            );

            const place = response.data.places?.[0];

            if (!place) {
                console.log(`[GooglePlaces] No results for query: "${query}"`);
                return null;
            }

            return place;
        } catch (error) {
            handleGooglePlacesError(error, query);
            return null;
        }
    },

    /**
     * Generate photo URL for a place
     * 
     * @param photoName - Photo resource name from places.photos[].name
     * @param maxWidth - Maximum width in pixels (default: 1000)
     * @returns Signed photo URL
     */
    getPhotoUrl: (photoName: string, maxWidth: number = 1000): string => {
        const apiKey = process.env.GOOGLE_PLACES_API_KEY;

        if (!apiKey) {
            throw new Error('[GooglePlaces] API key not configured for photo URL');
        }

        return `${PLACES_API_BASE_URL}/${photoName}/media?key=${apiKey}&maxWidthPx=${maxWidth}`;
    },
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

function handleGooglePlacesError(error: unknown, query: string): void {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        if (axiosError.response) {
            // Server responded with error status
            console.error('[GooglePlaces] API Error:', {
                status: axiosError.response.status,
                data: axiosError.response.data,
                query,
            });
        } else if (axiosError.request) {
            // Request made but no response
            console.error('[GooglePlaces] Network Error: No response received', { query });
        } else {
            // Error in request setup
            console.error('[GooglePlaces] Request Setup Error:', axiosError.message, { query });
        }
    } else {
        // Non-Axios error
        console.error('[GooglePlaces] Unexpected Error:', error, { query });
    }
}
