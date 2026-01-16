/**
 * Place Discovery Orchestrator - Clean Pipeline (2026 Standard)
 * 
 * Single Responsibility: Coordinate the discovery workflow
 * 
 * This is a THIN orchestration layer that delegates to specialized services.
 */

import { PlaceCandidate } from '../types/place.types';
import { generateCuratedCandidates } from './ai/curator.generator';
import { enrichCandidates } from './places/placeEnrichment.service';

interface DiscoveryInput {
    destination: string;
    startDate: string;
    endDate: string;
    interests: string[];
    budget?: string;
    travelers?: string;
    mustHaveItems?: string[];
}

export const PlaceDiscoveryOrchestrator = {
    /**
     * Main entry point: Generate personalized place candidates
     */
    generateCandidates: async (input: DiscoveryInput): Promise<PlaceCandidate[]> => {
        try {
            console.log(`[PlaceDiscovery] Starting generation for ${input.destination}...`);

            // Step 1: Calculate adaptive count
            const candidateCount = calculateAdaptiveCount(input.startDate, input.endDate);
            console.log(`[PlaceDiscovery] Adaptive Count: ${candidateCount} places`);

            // Step 2: Generate AI candidates
            const aiCandidates = await generateCuratedCandidates(input, candidateCount);
            console.log(`[PlaceDiscovery] AI generated ${aiCandidates.length} candidates`);

            // Step 3: Enrich with real data
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

/**
 * Calculate optimal candidate count based on trip duration
 * Logic: ~3 places per day, clamped between 6-15
 */
function calculateAdaptiveCount(start: string, end: string): number {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    return Math.min(15, Math.max(6, days * 3));
}