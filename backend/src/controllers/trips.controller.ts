/**
 * Trips Controller
 * 
 * Responsibility: HTTP API interface layer.
 * This controller is a "dumb" layer that ONLY handles:
 * - Input validation (Zod)
 * - User ID extraction from auth
 * - Calling business logic service
 * - Mapping errors to HTTP status codes
 * 
 * All business logic resides in TripsService.
 * 
 * @module controllers/trips
 */

import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import {
    TripsService,
    TripNotFoundError,
    ForbiddenError,
    ValidationError
} from '../services/trips.service';
import { LogisticsInput } from '../utils/logisticsFilter.util';

// ============================================================================
// INPUT VALIDATION SCHEMAS
// ============================================================================

const TripRequestSchema = z.object({
    destination: z.string().min(1),
    startDate: z.string(),
    endDate: z.string(),
    travelers: z.string().optional(),
    budget: z.string().optional(),
    interests: z.array(z.string()).optional(),
    mustHaveItems: z.array(z.string()).optional(),
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
        suggestedCategory: z.string().optional()
    }).passthrough(),
    direction: z.enum(['like', 'dislike'])
});

// ============================================================================
// ERROR HANDLER
// ============================================================================

/**
 * Maps service errors to HTTP responses.
 */
function handleServiceError(error: unknown, res: Response): void {
    if (error instanceof TripNotFoundError) {
        res.status(404).json({ error: 'Trip not found' });
        return;
    }

    if (error instanceof ForbiddenError) {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }

    if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
        return;
    }

    if (error instanceof z.ZodError) {
        res.status(400).json({ error: 'Invalid request data', details: error.errors });
        return;
    }

    console.error('[TripsController] Unhandled error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * POST /trips/generate
 * Creates a new trip with AI-generated place candidates.
 */
export const generateTripCandidates = async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = TripRequestSchema.parse(req.body);
        const userId = (req as AuthenticatedRequest).user.uid;

        const result = await TripsService.createTrip({
            userId,
            destination: validatedData.destination,
            startDate: validatedData.startDate,
            endDate: validatedData.endDate,
            travelers: validatedData.travelers,
            budget: validatedData.budget,
            interests: validatedData.interests,
            mustHaveItems: validatedData.mustHaveItems,
            logistics: validatedData.logistics as LogisticsInput | undefined
        });

        res.json({
            success: true,
            tripId: result.tripId,
            candidates: result.candidates,
            scheduleNotes: result.scheduleNotes
        });
    } catch (error) {
        handleServiceError(error, res);
    }
};

/**
 * GET /trips
 * Returns all trips for the authenticated user.
 */
export const getUserTrips = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as AuthenticatedRequest).user.uid;
        const trips = await TripsService.getUserTrips(userId);
        res.json(trips);
    } catch (error) {
        handleServiceError(error, res);
    }
};

/**
 * GET /trips/:tripId
 * Returns a single trip by ID.
 */
export const getTripById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tripId } = req.params;
        const userId = (req as AuthenticatedRequest).user.uid;
        const trip = await TripsService.getTripById(tripId, userId);
        res.json(trip);
    } catch (error) {
        handleServiceError(error, res);
    }
};

/**
 * POST /trips/:tripId/swipe
 * Records a swipe action (like/dislike) for a place.
 */
export const swipePlace = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tripId } = req.params;
        const userId = (req as AuthenticatedRequest).user.uid;
        const { place, direction } = SwipeSchema.parse(req.body);

        await TripsService.recordSwipe({
            userId,
            tripId,
            place,
            direction
        });

        res.json({ success: true });
    } catch (error) {
        handleServiceError(error, res);
    }
};

/**
 * POST /trips/:tripId/build-itinerary
 * Generates an AI-powered itinerary from liked places.
 */
export const buildItinerary = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tripId } = req.params;
        const userId = (req as AuthenticatedRequest).user.uid;

        const result = await TripsService.generateItinerary(tripId, userId);

        res.json({
            success: true,
            itinerary: result.itinerary,
            likedPlacesCount: result.likedPlacesCount,
            tripContext: result.tripContext
        });
    } catch (error) {
        handleServiceError(error, res);
    }
};