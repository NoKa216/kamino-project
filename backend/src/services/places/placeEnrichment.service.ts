/**
 * Place Enrichment Service
 * 
 * Single Responsibility: Enrich AI candidates with real data from Google Places
 * 
 * This service handles:
 * - Cache-first data retrieval
 * - Google Places API integration
 * - Data transformation
 * - Firestore caching
 */

import { db } from '../../config/firebase';
import { PlaceCandidate } from '../../types/place.types';
import { GooglePlacesClient, GooglePlaceSearchResult } from '../../clients/googlePlaces.client';
import { UrlSigner } from '../../utils/urlSigner.util';

/**
 * Enriches AI-generated candidates with real data from cache or Google Places API
 */
export async function enrichCandidates(
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

/**
 * Transform Google Places API response into our data format
 * 
 * STRICT LEAN SCHEMA - Store ONLY essential data:
 * - photoRefs (references, not URLs with API keys)
 * - coordinates (frontend generates map URL from this)
 * - rating/userRatingCount (trust signals)
 * - googlePlaceId (for future lookups)
 * 
 * DO NOT STORE:
 * - staticMapUrl (SECURITY: contains API key)
 * - openingHours/weekdayText (BLOAT: fetch on demand)
 * - location (low value, can derive from coordinates)
 */
function processGoogleData(googleData: GooglePlaceSearchResult): Partial<PlaceCandidate> {
    // Extract photo REFERENCES only (not URLs with API keys)
    const photoRefs: string[] = [];
    if (googleData.photos && googleData.photos.length > 0) {
        const photosToExtract = googleData.photos.slice(0, 5);
        photosToExtract.forEach((photo) => {
            photoRefs.push(photo.name);
        });
    }

    // Extract coordinates (frontend generates map URL from these)
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
            weekdayText: googleData.regularOpeningHours.weekdayDescriptions,
        }
        : undefined;

    // Return essential data for frontend
    return {
        coordinates,
        googlePlaceId: googleData.id,
        photoRefs,
        rating: googleData.rating || undefined,
        userRatingCount: googleData.userRatingCount || undefined,
        location: googleData.formattedAddress || undefined,
        openingHours,
    };
}

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
        // Return cached data
        return {
            coordinates: data.location,
            photoRefs: data.photoRefs || data.photos || [],
            googlePlaceId: data.googlePlaceId,
            rating: data.rating,
            userRatingCount: data.userRatingCount,
            location: data.formattedAddress || undefined,
            openingHours: data.openingHours || undefined,
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
        const document: Record<string, any> = {
            name,
            normalizedName,
            cityContext: cityContext.toLowerCase(),
            createdAt: new Date().toISOString(),
        };

        if (enrichedData.coordinates) document.location = enrichedData.coordinates;
        if (googleData.formattedAddress) document.formattedAddress = googleData.formattedAddress;
        if (googleData.editorialSummary?.text) document.editorialSummary = googleData.editorialSummary.text;
        if (enrichedData.photoRefs) document.photoRefs = enrichedData.photoRefs;
        if (enrichedData.rating !== undefined) document.rating = enrichedData.rating;
        if (enrichedData.userRatingCount !== undefined) document.userRatingCount = enrichedData.userRatingCount;
        if (enrichedData.openingHours !== undefined) document.openingHours = enrichedData.openingHours;
        if (enrichedData.staticMapUrl !== undefined) document.staticMapUrl = enrichedData.staticMapUrl;
        if (googleData.id) document.googlePlaceId = googleData.id;

        await db.collection('places').add(document);
    } catch (error) {
        console.error('[Cache] Save failed:', error);
    }
}
