/**
 * Trips Service
 * 
 * Responsibility: All business logic for trip management.
 * This service is Express-agnostic (no req/res dependencies).
 * It returns data or throws typed errors for the controller to handle.
 * 
 * Operations:
 * - Trip creation with AI-powered place discovery
 * - User trip retrieval
 * - Swipe recording with analytics
 * - AI-powered itinerary generation
 * 
 * @module services/trips
 */

import { db } from '../config/firebase';
import { PlaceDiscoveryOrchestrator } from './placeDiscovery.orchestrator';
import { applyLogisticsFilters, LogisticsInput } from '../utils/logisticsFilter.util';
import { getCuratedImage } from '../utils/destinationImages.util';
import { GeminiClient } from '../clients/gemini.client';
import { constructItineraryPrompt, PlaceSignal, TripContext } from '../utils/ai/itineraryPrompts.util';
import * as admin from 'firebase-admin';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Input for creating a new trip
 */
export interface CreateTripInput {
    userId: string;
    destination: string;
    startDate: string;
    endDate: string;
    travelers?: string;
    budget?: string;
    interests?: string[];
    mustHaveItems?: string[];
    logistics?: LogisticsInput;
}

/**
 * Result of trip creation
 */
export interface CreateTripResult {
    tripId: string;
    candidates: PlaceCandidate[];
    scheduleNotes: string[];
}

/**
 * Place candidate structure
 */
export interface PlaceCandidate {
    id: string;
    name: string;
    suggestedCategory?: string;
    matchReason?: string;
    matchTag?: string;
    description?: string;
    coordinates?: { lat: number; lng: number };
    photoRefs?: string[];
    rating?: number;
    userRatingCount?: number;
    location?: string;
}

/**
 * Trip document from Firestore
 */
export interface TripDocument {
    id: string;
    userId: string;
    status: string;
    destination: string;
    startDate: string;
    endDate: string;
    heroImage?: string;
    travelers?: string;
    budget?: string;
    interests?: string[];
    logistics?: LogisticsInput;
    candidates: PlaceCandidate[];
    scheduleNotes?: string[];
    swipedLikeIds: string[];
    swipedDislikeIds: string[];
    itinerary?: ItineraryResult;
    createdAt: string;
    updatedAt?: string;
}

/**
 * Input for recording a swipe
 */
export interface SwipeInput {
    userId: string;
    tripId: string;
    place: {
        id: string;
        name: string;
        suggestedCategory?: string;
    };
    direction: 'like' | 'dislike';
}

/**
 * Generated itinerary structure
 */
export interface ItineraryResult {
    userPersona: string;
    days: ItineraryDay[];
    summary: string;
}

export interface ItineraryDay {
    date: string;
    dayNumber: number;
    theme: string;
    activities: ItineraryActivity[];
}

export interface ItineraryActivity {
    time: string;
    placeId: string;
    placeName: string;
    category: string;
    duration: string;
    notes: string;
    isAISuggestion: boolean;
}

/**
 * Result of itinerary generation
 */
export interface GenerateItineraryResult {
    itinerary: ItineraryResult;
    likedPlacesCount: number;
    tripContext: TripContext;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class TripNotFoundError extends Error {
    constructor(tripId: string) {
        super(`Trip not found: ${tripId}`);
        this.name = 'TripNotFoundError';
    }
}

export class ForbiddenError extends Error {
    constructor(message = 'Access denied') {
        super(message);
        this.name = 'ForbiddenError';
    }
}

export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

// ============================================================================
// SERVICE
// ============================================================================

export const TripsService = {
    /**
     * Creates a new trip with AI-generated place candidates.
     * 
     * Flow:
     * 1. Generate raw candidates from AI
     * 2. Apply logistics-aware filters
     * 3. Get curated hero image
     * 4. Persist to Firestore
     * 
     * @param input - Trip creation parameters
     * @returns Trip ID and generated candidates
     */
    createTrip: async (input: CreateTripInput): Promise<CreateTripResult> => {
        const {
            userId,
            destination,
            startDate,
            endDate,
            travelers,
            budget,
            interests,
            mustHaveItems,
            logistics
        } = input;

        // Step 1: Generate raw candidates from AI
        const rawCandidates = await PlaceDiscoveryOrchestrator.generateCandidates({
            destination,
            startDate,
            endDate,
            interests: interests || [],
            budget,
            travelers,
            mustHaveItems
        });

        // Step 2: Apply logistics-aware filters
        const { candidates, scheduleNotes } = applyLogisticsFilters(
            rawCandidates,
            logistics
        );

        if (scheduleNotes.length > 0) {
            console.log(`[TripsService] Schedule adjusted: ${scheduleNotes.join(', ')}`);
        }

        // Step 3: Get hero image (curated preferred)
        const heroImage = getCuratedImage(destination);

        // Step 4: Build trip document
        const tripData = {
            userId,
            status: 'planning',
            destination,
            startDate,
            endDate,
            ...(heroImage && { heroImage }),
            travelers,
            budget,
            interests,
            logistics,
            candidates,
            scheduleNotes,
            swipedLikeIds: [],
            swipedDislikeIds: [],
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('trips').add(tripData);

        return {
            tripId: docRef.id,
            candidates: candidates as PlaceCandidate[],
            scheduleNotes
        };
    },

    /**
     * Retrieves all trips for a user, ordered by creation date.
     * 
     * @param userId - Firebase user ID
     * @returns Array of trip documents
     */
    getUserTrips: async (userId: string): Promise<TripDocument[]> => {
        const snapshot = await db
            .collection('trips')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as TripDocument[];
    },

    /**
     * Retrieves a single trip by ID with ownership verification.
     * 
     * @param tripId - Firestore document ID
     * @param userId - Firebase user ID for ownership check
     * @returns Trip document
     * @throws TripNotFoundError if trip doesn't exist
     * @throws ForbiddenError if user doesn't own the trip
     */
    getTripById: async (tripId: string, userId: string): Promise<TripDocument> => {
        const doc = await db.collection('trips').doc(tripId).get();

        if (!doc.exists) {
            throw new TripNotFoundError(tripId);
        }

        const tripData = doc.data();

        if (tripData?.userId !== userId) {
            throw new ForbiddenError('You do not own this trip');
        }

        return {
            id: doc.id,
            ...tripData
        } as TripDocument;
    },

    /**
     * Records a swipe action with dual-write pattern.
     * 
     * Writes:
     * 1. Analytics: user_interactions collection (for ML)
     * 2. UI Sync: trips document with lean ID storage
     * 
     * @param input - Swipe parameters
     * @throws TripNotFoundError if trip doesn't exist
     * @throws ForbiddenError if user doesn't own the trip
     */
    recordSwipe: async (input: SwipeInput): Promise<void> => {
        const { userId, tripId, place, direction } = input;

        // Verify ownership
        const tripRef = db.collection('trips').doc(tripId);
        const tripDoc = await tripRef.get();

        if (!tripDoc.exists) {
            throw new TripNotFoundError(tripId);
        }

        const tripData = tripDoc.data();
        if (tripData?.userId !== userId) {
            throw new ForbiddenError();
        }

        // Atomic batch write
        const batch = db.batch();

        // Write 1: Analytics with rich context
        const analyticsRef = db.collection('user_interactions').doc();
        batch.set(analyticsRef, {
            userId,
            tripId,
            placeId: place.id,
            action: direction,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            metadata: {
                category: place.suggestedCategory || 'unknown',
                city: tripData.destination || 'unknown',
                placeName: place.name,
            },
            tripContext: {
                budget: tripData.budget || 'unknown',
                group: tripData.travelers || 'unknown',
                interests: tripData.interests || [],
            }
        });

        // Write 2: Update trip document
        const fieldName = direction === 'like' ? 'swipedLikeIds' : 'swipedDislikeIds';
        batch.update(tripRef, {
            [fieldName]: admin.firestore.FieldValue.arrayUnion(place.id)
        });

        await batch.commit();
        console.log(`[TripsService] Recorded ${direction} for ${place.name}`);
    },

    /**
     * Generates a personalized itinerary from liked places using AI.
     * 
     * Flow:
     * 1. Fetch trip and validate ownership
     * 2. Resolve liked/disliked places from candidates
     * 3. Construct AI prompt with persona analysis
     * 4. Call Gemini for itinerary generation
     * 5. Parse and persist itinerary
     * 
     * @param tripId - Trip document ID
     * @param userId - User ID for ownership check
     * @returns Generated itinerary with metadata
     * @throws TripNotFoundError if trip doesn't exist
     * @throws ForbiddenError if user doesn't own the trip
     * @throws ValidationError if no liked places exist
     */
    generateItinerary: async (tripId: string, userId: string): Promise<GenerateItineraryResult> => {
        console.log('\n========================================');
        console.log('[TripsService] ITINERARY GENERATION STARTED');
        console.log('========================================');

        // Step 1: Fetch and validate trip
        const tripRef = db.collection('trips').doc(tripId);
        const tripDoc = await tripRef.get();

        if (!tripDoc.exists) {
            throw new TripNotFoundError(tripId);
        }

        const tripData = tripDoc.data();

        if (tripData?.userId !== userId) {
            throw new ForbiddenError();
        }

        // Step 2: Extract place data
        const likedPlaceIds: string[] = tripData?.swipedLikeIds || [];
        const dislikedPlaceIds: string[] = tripData?.swipedDislikeIds || [];
        const allCandidates = tripData?.candidates || [];

        const likedPlaces: PlaceSignal[] = allCandidates.filter(
            (c: PlaceCandidate) => likedPlaceIds.includes(c.id)
        );
        const dislikedPlaces: PlaceSignal[] = allCandidates.filter(
            (c: PlaceCandidate) => dislikedPlaceIds.includes(c.id)
        );

        console.log(`[TripsService] Liked: ${likedPlaces.length}, Disliked: ${dislikedPlaces.length}`);

        if (likedPlaces.length === 0) {
            throw new ValidationError('No liked places to build itinerary from');
        }

        // Step 3: Build context
        const logistics = tripData?.logistics;
        const tripContext: TripContext = {
            destination: tripData?.destination,
            startDate: tripData?.startDate,
            endDate: tripData?.endDate,
            travelers: tripData?.travelers || 'solo',
            budget: tripData?.budget || 'moderate',
            arrivalTime: logistics?.flightDetails?.arrivalTime,
            departureTime: logistics?.flightDetails?.departureTime,
            hotelName: logistics?.accommodationDetails?.hotelName,
        };

        // Step 4: Generate prompt and call AI
        const prompt = constructItineraryPrompt(likedPlaces, dislikedPlaces, tripContext);
        console.log('[TripsService] Calling Gemini AI...');

        const aiRawResponse = await GeminiClient.generateText(prompt);

        // Step 5: Parse response
        let parsedItinerary: ItineraryResult;
        try {
            parsedItinerary = JSON.parse(aiRawResponse);
        } catch {
            // Fallback: extract JSON object from response
            const jsonMatch = aiRawResponse.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedItinerary = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Could not parse itinerary from AI response');
            }
        }

        console.log('[TripsService] Itinerary parsed successfully');

        // Step 6: Persist itinerary
        await tripRef.update({
            status: 'itinerary_generated',
            itinerary: parsedItinerary,
            updatedAt: new Date().toISOString(),
        });

        console.log('========================================');
        console.log('[TripsService] ITINERARY GENERATION COMPLETE');
        console.log('========================================\n');

        return {
            itinerary: parsedItinerary,
            likedPlacesCount: likedPlaces.length,
            tripContext,
        };
    }
};
