/**
 * Shared Type Definitions for Place Data
 * Used across both Frontend (React Native) and Backend (Node.js)
 * 
 * This ensures type safety and consistency across the entire stack.
 */

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface OpeningHours {
    openNow: boolean;
    weekdayText: string[];
}

export interface PlaceCandidate {
    // Core identifiers
    id: string;
    name: string;
    googlePlaceId?: string;

    // AI-generated matching info
    matchTag?: string;       // Short tag with emoji (max 5 words) - for card display
    matchReason: string;     // Detailed explanation (2 sentences) - for modal
    suggestedCategory: PlaceCategoryId;
    description: string;

    // Location data
    coordinates?: Coordinates;
    location?: string;       // Formatted address from Google

    // Media
    photos?: string[];       // Array of photo URLs (signed/secure) - DEPRECATED
    photoRefs?: string[];    // Photo references (not full URLs) - NEW SECURE METHOD
    staticMapUrl?: string;   // Digitally signed Static Maps API URL

    // Social proof
    rating?: number;
    userRatingCount?: number;

    // Availability
    openingHours?: OpeningHours | null;
}

/**
 * Strictly typed category IDs
 * Ensures consistency between AI generation and frontend display
 */
export type PlaceCategoryId =
    // Food & Drink
    | 'foodie'
    | 'wine'
    | 'coffee'
    | 'streetfood'
    | 'beer'
    // Nature & Outdoors
    | 'nature'
    | 'beaches'
    | 'hiking'
    | 'water_sports'
    | 'parks'
    // Urban & Culture
    | 'shopping'
    | 'nightlife'
    | 'luxury'
    | 'architecture'
    | 'history'
    | 'museums'
    | 'culture'
    | 'music'
    | 'photography'
    // Activities
    | 'wellness'
    | 'adventure'
    | 'sports';

/**
 * Category metadata for display purposes
 */
export interface CategoryMetadata {
    id: PlaceCategoryId;
    displayName: string;
    emoji: string;
    defaultTags: string[];
}

/**
 * Type guard to check if a string is a valid PlaceCategoryId
 */
export function isValidCategory(value: unknown): value is PlaceCategoryId {
    const validCategories: PlaceCategoryId[] = [
        'foodie', 'wine', 'coffee', 'streetfood', 'beer',
        'nature', 'beaches', 'hiking', 'water_sports', 'parks',
        'shopping', 'nightlife', 'luxury', 'architecture', 'history',
        'museums', 'culture', 'music', 'photography',
        'wellness', 'adventure', 'sports'
    ];
    return typeof value === 'string' && validCategories.includes(value as PlaceCategoryId);
}
