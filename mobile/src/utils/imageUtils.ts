/**
 * Image Utilities - Enterprise Grade
 * 
 * SECURITY: Uses backend proxy for photos (no client-side API key)
 * Static maps still use client-side key (acceptable for maps)
 */

import { Platform } from 'react-native';

// Get backend base URL
const getBaseUrl = (): string => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000/api';
    }
    return 'http://localhost:3000/api';
};

const API_BASE_URL = getBaseUrl();

/**
 * Construct Photo URL via backend proxy
 * 
 * SECURITY: Routes through backend to hide API key
 * 
 * @param photoRef - Photo reference string (e.g., "places/abc123/photos/xyz")
 * @param maxWidth - Maximum width in pixels (default: 1000)
 * @returns Backend proxy URL for the photo
 */
export function getPhotoUrl(photoRef: string, maxWidth: number = 600): string {
    if (!photoRef) return '';

    // Route through backend proxy to hide API key
    return `${API_BASE_URL}/places/photo/${photoRef}?maxWidth=${maxWidth}`;
}

/**
 * Convert array of photo references to full URLs
 * 
 * @param photoRefs - Array of photo references
 * @param maxWidth - Maximum width for each image
 * @returns Array of proxy URLs
 */
export function getPhotoUrls(photoRefs: string[], maxWidth: number = 600): string[] {
    return photoRefs.map(ref => getPhotoUrl(ref, maxWidth));
}

/**
 * Generate Google Static Map URL from coordinates
 * 
 * Note: Static maps API requires client-side key (different from Places API)
 * This is acceptable as static maps keys can be restricted to specific referrers
 */
export function getStaticMapUrl(
    lat: number,
    lng: number,
    zoom: number = 15,
    size: string = '600x300'
): string {
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

    if (!apiKey) {
        // Fallback to OpenStreetMap if no API key
        return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${size}&markers=${lat},${lng},red`;
    }

    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=${apiKey}`;
}

