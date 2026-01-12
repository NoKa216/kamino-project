import { Request, Response } from 'express';
import { model } from '../config/gemini';
import { db } from '../config/firebase';
import { z } from 'zod';

// Input validation schema
// Input validation schema
const TripRequestSchema = z.object({
    destination: z.string().min(1),
    startDate: z.string(), // ISO date string
    endDate: z.string(),   // ISO date string
    travelers: z.string().optional(), // e.g., "couple", "solo", "family"
    budget: z.string().optional(),    // e.g., "medium", "luxury"
    interests: z.array(z.string()).optional(),
    mustHaveItems: z.array(z.string()).optional() // NEW
});

import { PlaceDiscoveryOrchestrator } from '../services/placeDiscovery.orchestrator';

export const generateTripCandidates = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Validate Input
        const validatedData = TripRequestSchema.parse(req.body);
        const { destination, startDate, endDate, travelers, budget, interests, mustHaveItems } = validatedData;

        // 2. Call Discovery Orchestrator
        const candidates = await PlaceDiscoveryOrchestrator.generateCandidates({
            destination,
            interests: interests || [],
            budget,
            travelers,
            mustHaveItems
        });

        // 3. Save to Firestore (Root 'trips' collection)
        const userId = (req as any).user?.uid;
        if (!userId) {
            res.status(401).json({ error: 'User must be authenticated' });
            return;
        }

        const tripData = {
            userId,
            status: 'planning',
            candidates,
            swipedLikes: [],
            destination,
            startDate,
            endDate,
            travelers,
            budget,
            interests,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('trips').add(tripData);

        // 4. Return Response
        res.json({
            success: true,
            tripId: docRef.id,
            candidates
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ error: error.errors });
        } else {
            console.error('Error generating candidates:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

export const getUserTrips = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.uid;
        if (!userId) {
            res.status(401).json({ error: 'User must be authenticated' });
            return;
        }

        const snapshot = await db.collection('trips')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const trips = snapshot.docs.map(doc => ({
            tripId: doc.id,
            ...doc.data()
        }));

        res.json(trips);
    } catch (error) {
        console.error('Error fetching trips:', error);
        res.status(500).json({ error: 'Internal Server Error fetching trips' });
    }
};
