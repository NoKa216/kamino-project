/**
 * Trips Controller - Production Ready
 * 
 * Handles trip generation, swipe persistence, and trip retrieval
 * All endpoints verify user ownership
 */

import { Request, Response } from 'express';
import { db } from '../config/firebase';
import { z } from 'zod';
import { PlaceDiscoveryOrchestrator } from '../services/placeDiscovery.orchestrator';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { applyLogisticsFilters, LogisticsInput } from '../utils/logisticsFilter.util';
import * as admin from 'firebase-admin';

// Input validation schemas
const TripRequestSchema = z.object({
    destination: z.string().min(1),
    startDate: z.string(),
    endDate: z.string(),
    travelers: z.string().optional(),
    budget: z.string().optional(),
    interests: z.array(z.string()).optional(),
    mustHaveItems: z.array(z.string()).optional(),
    // Logistics data for smart schedule generation
    logistics: z.object({
        hasBookedFlights: z.boolean().optional(),
        flightDetails: z.object({
            arrivalTime: z.string().optional(),
            departureTime: z.string().optional(),
            flightNumber: z.string().optional()
        }).optional(),
        hasBookedAccommodation: z.boolean().optional(),
        accommodationDetails: z.object({
            hotelName: z.string().optional(),
            location: z.string().optional()
        }).optional()
    }).optional()
});

const SwipeSchema = z.object({
    place: z.object({
        id: z.string(),
        name: z.string(),
    }).passthrough(), // Allow additional fields
    direction: z.enum(['like', 'dislike'])
});

/**
 * Generate trip with AI-powered place recommendations
 */
export const generateTripCandidates = async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = TripRequestSchema.parse(req.body);
        const { destination, startDate, endDate, travelers, budget, interests, mustHaveItems, logistics } = validatedData;

        // Get authenticated user
        const userId = (req as AuthenticatedRequest).user.uid;

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

        // Step 2: Apply logistics-aware filters (arrival/departure time, accommodation)
        const { candidates, scheduleNotes } = applyLogisticsFilters(
            rawCandidates,
            logistics as LogisticsInput | undefined
        );

        if (scheduleNotes.length > 0) {
            console.log(`[Trips] Schedule adjusted: ${scheduleNotes.join(', ')}`);
        }

        // Save to Firestore with proper structure
        const tripData = {
            userId,
            status: 'planning',
            destination,        // CRITICAL: At root level for list view
            startDate,          // CRITICAL: At root level
            endDate,            // CRITICAL: At root level
            travelers,
            budget,
            interests,
            logistics,          // Store logistics for reference
            candidates,
            scheduleNotes,      // Store generated notes for UI
            swipedLikeIds: [],      // LEAN: Store IDs only
            swipedDislikeIds: [],   // LEAN: Store IDs only
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('trips').add(tripData);

        res.json({
            success: true,
            tripId: docRef.id,
            candidates,
            scheduleNotes       // Return notes to frontend
        });
    } catch (error) {
        console.error('Error generating candidates:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get all trips for authenticated user
 */
export const getUserTrips = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user.uid;

        const snapshot = await db
            .collection('trips')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const trips = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        res.json(trips);
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).json({ error: 'Internal Server Error fetching trips' });
    }
};

/**
 * Get a single trip by ID (for resume functionality)
 */
export const getTripById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tripId } = req.params;
        const userId = (req as AuthenticatedRequest).user.uid;

        const doc = await db.collection('trips').doc(tripId).get();

        if (!doc.exists) {
            res.status(404).json({ error: 'Trip not found' });
            return;
        }

        const tripData = doc.data();

        // Verify ownership
        if (tripData?.userId !== userId) {
            res.status(403).json({ error: 'Forbidden: You do not own this trip' });
            return;
        }

        res.json({
            id: doc.id,
            ...tripData
        });
    } catch (error) {
        console.error('Error fetching trip:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Record swipe action (like/dislike) for learning
 * 
 * Dual-write pattern:
 * 1. Analytics: Write to user_interactions collection for ML
 * 2. UI Sync: Update trips document with lean ID-only storage
 */
export const swipePlace = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tripId } = req.params;
        const userId = (req as AuthenticatedRequest).user.uid;
        const { place, direction } = SwipeSchema.parse(req.body);

        // Verify ownership first
        const tripRef = db.collection('trips').doc(tripId);
        const tripDoc = await tripRef.get();

        if (!tripDoc.exists) {
            res.status(404).json({ error: 'Trip not found' });
            return;
        }

        const tripData = tripDoc.data();
        if (tripData?.userId !== userId) {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }

        // ATOMIC BATCH WRITE - Analytics + UI sync in single transaction
        const batch = db.batch();

        // Action 1: ANALYTICS - Write to user_interactions collection
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
            }
        });

        // Action 2: UI SYNC - Update trips document with LEAN storage (IDs only)
        const fieldName = direction === 'like' ? 'swipedLikeIds' : 'swipedDislikeIds';
        batch.update(tripRef, {
            [fieldName]: admin.firestore.FieldValue.arrayUnion(place.id)
        });

        // Commit both writes atomically
        await batch.commit();
        console.log(`[Swipe] Recorded ${direction} for ${place.name} (atomic batch)`);

        res.json({ success: true });
    } catch (error) {
        console.error('Error recording swipe:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};