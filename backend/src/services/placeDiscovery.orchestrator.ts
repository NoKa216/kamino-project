/**
 * Place Discovery Orchestrator
 * 
 * Main Service Layer - Coordinates all place discovery operations
 * 
 * Responsibilities:
 * - Orchestrate workflow between AI, Google API, and Database
 * - Implement cache-first strategy
 * - Coordinate data enrichment pipeline
 * - Manage Firestore operations
 * 
 * Dependencies:
 * - GeminiClient: AI generation
 * - GooglePlacesClient: Place data fetching
 * - UrlSigner: Secure map URLs
 * - Firestore: Caching layer
 */

import { db } from '../config/firebase';
import { PlaceCandidate } from '../types/place.types';
import { GeminiClient, DiscoveryInput } from '../clients/gemini.client';
import { GooglePlacesClient, GooglePlaceSearchResult } from '../clients/googlePlaces.client';
import { UrlSigner } from '../utils/urlSigner.util';

// ============================================================================
// PUBLIC API
// ============================================================================

export const PlaceDiscoveryOrchestrator = {
    /**
     * Main entry point: Generate personalized place candidates with enriched data
     * 
     * @param input - User preferences and trip details
     * @returns Array of enriched place candidates ready for front end
     */
    generateCandidates: async (input: DiscoveryInput): Promise<PlaceCandidate[]> => {
        try {
            console.log(`[PlaceDiscovery] Starting generation for ${input.destination}...`);

            // Step 1: Generate candidates using AI
            const aiCandidates = await GeminiClient.generatePlaceCandidates(input);
            console.log(`[PlaceDiscovery] AI generated ${aiCandidates.length} candidates`);

            // Step 2: Enrich with real data (cache-first strategy)
            const enrichedCandidates = await enrichCandidates(aiCandidates, input.destination);
            console.log(`[PlaceDiscovery] Enriched ${enrichedCandidates.length} candidates`);

            return enrichedCandidates;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[PlaceDiscovery] Fatal error:', errorMessage);
            throw new Error(`Failed to generate candidates: ${errorMessage}`);
        }
    },
};

// ============================================================================
// ENRICHMENT PIPELINE
// ============================================================================

/**
 * Enrich AI-generated candidates with real data from cache or Google Places API
 * Implements cache-first strategy for performance and cost optimization
 */
async function enrichCandidates(
    candidates: Partial<PlaceCandidate>[],
    destinationContext: string
): Promise<PlaceCandidate[]> {
    const enriched: PlaceCandidate[] = [];

    for (const candidate of candidates) {
        try {
            if (!candidate.name) {
                console.warn('[Enrich] Skipping candidate without name');
                continue;
            }

            const normalizedName = candidate.name.toLowerCase().trim();

            // Try cache first
            const cachedData = await fetchFromCache(normalizedName, destinationContext);

            if (cachedData) {
                enriched.push({ ...candidate, ...cachedData } as PlaceCandidate);
                console.log(`[PlaceDiscovery] Cache Hit: ${candidate.name}`);
                continue;
            }

            // Fallback to Google Places API
            console.log(`[PlaceDiscovery] Cache Miss: ${candidate.name}. Fetching from Google...`);
            const googleData = await GooglePlacesClient.searchPlace(
                `${candidate.name} in ${destinationContext}`
            );

            if (googleData) {
                const enrichedData = processGoogleData(googleData);
                const fullCandidate = { ...candidate, ...enrichedData } as PlaceCandidate;
                enriched.push(fullCandidate);

                // Save to cache for future requests
                await saveToCache(candidate.name, normalizedName, destinationContext, enrichedData, googleData);
            } else {
                // No Google data available, use AI-only data
                enriched.push(candidate as PlaceCandidate);
            }
        } catch (error) {
            console.error(`[Enrich] Failed to enrich ${candidate.name}:`, error);
            enriched.push(candidate as PlaceCandidate);
        }
    }

    return enriched.map(candidate => {
        // Remove all undefined fields to prevent Firestore errors
        const cleaned: any = {};
        for (const key in candidate) {
            if (candidate[key as keyof PlaceCandidate] !== undefined) {
                cleaned[key] = candidate[key as keyof PlaceCandidate];
            }
        }
        return cleaned as PlaceCandidate;
    });
}

// ============================================================================
// DATA PROCESSING
// ============================================================================

/**
 * Transform Google Places API response into our data format
 */
function processGoogleData(googleData: GooglePlaceSearchResult): Partial<PlaceCandidate> {
    // Extract photo URLs
    const photoUrls: string[] = [];
    if (googleData.photos && googleData.photos.length > 0) {
        const photosToFetch = googleData.photos.slice(0, 5);
        photosToFetch.forEach((photo) => {
            photoUrls.push(GooglePlacesClient.getPhotoUrl(photo.name));
        });
    }

    // Extract coordinates
    const coordinates = googleData.location
        ? {
            lat: googleData.location.latitude,
            lng: googleData.location.longitude,
        }
        : undefined;

    // Extract opening hours
    const openingHours = googleData.regularOpeningHours
        ? {
            openNow: googleData.regularOpeningHours.openNow,
            weekdayText: googleData.regularOpeningHours.weekdayDescriptions || [],
        }
        : null; // Use null instead of undefined for Firestore

    // Generate signed map URL
    const staticMapUrl = coordinates
        ? UrlSigner.createSignedMapUrl(coordinates.lat, coordinates.lng)
        : undefined;

    return {
        coordinates,
        location: googleData.formattedAddress,
        googlePlaceId: googleData.id,
        photos: photoUrls,
        rating: googleData.rating || undefined,
        userRatingCount: googleData.userRatingCount || undefined,
        openingHours: openingHours || null,
        staticMapUrl: staticMapUrl || null,
    };
}

// ============================================================================
// CACHE OPERATIONS
// ============================================================================

/**
 * Fetch place data from Firestore cache
 */
async function fetchFromCache(
    normalizedName: string,
    cityContext: string
): Promise<Partial<PlaceCandidate> | null> {
    try {
        const docs = await db
            .collection('places')
            .where('normalizedName', '==', normalizedName)
            .where('cityContext', '==', cityContext.toLowerCase())
            .limit(1)
            .get();

        if (docs.empty) return null;

        const data = docs.docs[0].data();
        return {
            coordinates: data.location,
            location: data.formattedAddress,
            photos: data.photos || [],
            googlePlaceId: data.googlePlaceId,
            rating: data.rating,
            userRatingCount: data.userRatingCount,
            openingHours: data.openingHours || undefined,
            staticMapUrl: data.staticMapUrl || undefined,
        };
    } catch (error) {
        console.error('[Cache] Fetch failed:', error);
        return null;
    }
}

/**
 * Save enriched place data to Firestore cache
 */
async function saveToCache(
    name: string,
    normalizedName: string,
    cityContext: string,
    enrichedData: Partial<PlaceCandidate>,
    googleData: GooglePlaceSearchResult
): Promise<void> {
    try {
        // Build document object, filtering out undefined values
        const document: Record<string, any> = {
            name,
            normalizedName,
            cityContext: cityContext.toLowerCase(),
            createdAt: new Date().toISOString(),
        };

        // Add fields only if they're defined (Firestore doesn't accept undefined)
        if (enrichedData.coordinates) document.location = enrichedData.coordinates;
        if (googleData.formattedAddress) document.formattedAddress = googleData.formattedAddress;
        if (googleData.editorialSummary?.text) document.editorialSummary = googleData.editorialSummary.text;
        if (enrichedData.photos) document.photos = enrichedData.photos;
        if (enrichedData.rating !== undefined) document.rating = enrichedData.rating;
        if (enrichedData.userRatingCount !== undefined) document.userRatingCount = enrichedData.userRatingCount;
        if (enrichedData.openingHours !== undefined) document.openingHours = enrichedData.openingHours;
        if (enrichedData.staticMapUrl !== undefined) document.staticMapUrl = enrichedData.staticMapUrl;
        if (googleData.id) document.googlePlaceId = googleData.id;

        await db.collection('places').add(document);
    } catch (error) {
        console.error('[Cache] Save failed:', error);
        // Don't throw - caching failure shouldn't break the flow
    }
}
