/**
 * URL Signing Utility
 * 
 * Responsibilities:
 * - Generate HMAC-SHA1 digital signatures for Google Static Maps URLs
 * - Prevent unauthorized API key usage
 * - Construct secure, signed map URLs
 * 
 * Security:
 * - Uses secret key from environment variables
 * - Implements URL-safe Base64 encoding
 * 
 * @see https://developers.google.com/maps/documentation/maps-static/digital-signature
 */

import crypto from 'crypto';
import url from 'url';
import { DARK_MAP_STYLE, STATIC_MAP_CONFIG } from '../constants/mapStyles';

// ============================================================================
// PUBLIC API
// ============================================================================

export const UrlSigner = {
    /**
     * Generate a digitally-signed Static Maps URL
     * 
     * @param lat - Latitude
     * @param lng - Longitude
     * @returns Signed URL or undefined if API key is missing
     */
    createSignedMapUrl: (lat: number, lng: number): string | undefined => {
        const apiKey = process.env.GOOGLE_STATIC_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
        const signingSecret = process.env.GOOGLE_MAPS_SIGNING_SECRET || '';

        if (!apiKey) {
            console.error('[UrlSigner] No API key configured for Static Maps');
            return undefined;
        }

        const center = `${lat},${lng}`;
        const { zoom, size, mapType, markerColor } = STATIC_MAP_CONFIG;

        // Construct base URL with all parameters
        const baseUrl = [
            'https://maps.googleapis.com/maps/api/staticmap',
            `?center=${center}`,
            `&zoom=${zoom}`,
            `&size=${size}`,
            `&maptype=${mapType}`,
            `&markers=color:${markerColor}|${center}`,
            `&style=${DARK_MAP_STYLE}`,
            `&key=${apiKey}`,
        ].join('');

        // Apply digital signature if secret is available
        return signUrl(baseUrl, signingSecret);
    },
};

// ============================================================================
// SIGNING ALGORITHM
// ============================================================================

/**
 * Sign a URL using HMAC-SHA1 digital signature
 * 
 * @param unsignedUrl - Complete URL without signature
 * @param secret - URL-safe Base64 encoded secret
 * @returns Signed URL with &signature= parameter
 */
function signUrl(unsignedUrl: string, secret: string): string {
    if (!secret) {
        console.warn('[UrlSigner] No signing secret provided - URL will be unsigned');
        return unsignedUrl;
    }

    const uri = url.parse(unsignedUrl);
    const path = uri.path;

    if (!path) {
        console.warn('[UrlSigner] Invalid URL - no path found');
        return unsignedUrl;
    }

    // Decode the URL-safe Base64 secret to binary
    const decodedSecret = Buffer.from(
        secret.replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
    );

    // Create HMAC-SHA1 signature of the path
    const signature = crypto
        .createHmac('sha1', decodedSecret)
        .update(path)
        .digest('base64');

    // Convert signature to URL-safe Base64
    const urlSafeSignature = signature
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${unsignedUrl}&signature=${urlSafeSignature}`;
}
