/**
 * Trips Routes - Production Ready with Real Auth
 * 
 * All routes protected by Firebase Auth middleware
 */

import { Router } from 'express';
import {
    generateTripCandidates,
    getUserTrips,
    getTripById,
    swipePlace,
    buildItinerary
} from '../controllers/trips.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.post('/generate', authenticate, generateTripCandidates);
router.get('/', authenticate, getUserTrips);
router.get('/:tripId', authenticate, getTripById);
router.post('/:tripId/swipe', authenticate, swipePlace);
router.post('/:tripId/build-itinerary', authenticate, buildItinerary);

export default router;

