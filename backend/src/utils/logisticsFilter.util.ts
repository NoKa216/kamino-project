/**
 * Logistics Filter Utility - Trip Generation
 * 
 * Applies context-aware filtering based on arrival/departure times
 * and accommodation location.
 * 
 * IMPORTANT: All times are treated as "floating local time" relative
 * to the destination (no timezone conversion needed).
 */

import { PlaceCandidate } from '../types/place.types';

// --- Interfaces ---

export interface LogisticsInput {
    hasBookedFlights?: boolean;
    flightDetails?: {
        arrivalTime?: string;   // "HH:mm" format, destination local time
        departureTime?: string; // "HH:mm" format, destination local time
        flightNumber?: string;
    };
    hasBookedAccommodation?: boolean;
    accommodationDetails?: {
        hotelName?: string;
        location?: string;
    };
}

export interface FilteredResult {
    candidates: PlaceCandidate[];
    scheduleNotes: string[];
}

// --- Helper Functions ---

/**
 * Parse "HH:mm" time string to hour number (0-23)
 */
function parseTimeToHour(timeStr: string | undefined): number | null {
    if (!timeStr) return null;
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    return parseInt(match[1], 10);
}

/**
 * Check if a category is a "daytime activity" (museums, parks, etc.)
 */
function isDaytimeActivity(category: string): boolean {
    const daytimeCategories = [
        'museum', 'park', 'landmark', 'attraction', 'tour',
        'historical', 'cultural', 'nature', 'beach', 'outdoor'
    ];
    const lowerCategory = category.toLowerCase();
    return daytimeCategories.some(cat => lowerCategory.includes(cat));
}

/**
 * Check if a category is evening-appropriate
 */
function isEveningActivity(category: string): boolean {
    const eveningCategories = [
        'restaurant', 'bar', 'nightlife', 'dinner', 'evening',
        'rooftop', 'sunset', 'club'
    ];
    const lowerCategory = category.toLowerCase();
    return eveningCategories.some(cat => lowerCategory.includes(cat));
}

// --- Main Filter Functions ---

/**
 * Apply arrival time filters to candidates
 * 
 * Rules:
 * - Afternoon arrival (>15:00): Mark daytime Day 1 activities as "skip"
 * - Night arrival (>20:00): Only check-in and late-night appropriate
 */
export function applyArrivalFilter(
    candidates: PlaceCandidate[],
    arrivalTime: string | undefined
): { candidates: PlaceCandidate[]; note: string | null } {
    const arrivalHour = parseTimeToHour(arrivalTime);

    if (arrivalHour === null) {
        return { candidates, note: null };
    }

    let note: string | null = null;
    const filtered = candidates.map((candidate, index) => {
        // Consider first 3-4 candidates as "Day 1" candidates
        const isDay1Candidate = index < 4;

        if (!isDay1Candidate) {
            return candidate;
        }

        const category = candidate.suggestedCategory || '';

        // Night arrival (>20:00): Skip all except evening activities
        if (arrivalHour >= 20) {
            if (!isEveningActivity(category)) {
                return {
                    ...candidate,
                    arrivalAdjusted: true,
                    skipReason: 'Night arrival - activity not available'
                };
            }
            note = `Schedule adjusted for ${arrivalTime} arrival`;
        }
        // Afternoon arrival (>15:00): Skip daytime activities
        else if (arrivalHour >= 15) {
            if (isDaytimeActivity(category)) {
                return {
                    ...candidate,
                    arrivalAdjusted: true,
                    skipReason: 'Afternoon arrival - daytime activity skipped'
                };
            }
            note = `Schedule adjusted for ${arrivalTime} arrival`;
        }

        return candidate;
    });

    return { candidates: filtered, note };
}

/**
 * Apply departure time filters to candidates
 * 
 * Rules:
 * - Morning departure (<12:00): Last day is just "Breakfast & Airport"
 * - 4-Hour Rule: No activity should end less than 4 hours before departure
 */
export function applyDepartureFilter(
    candidates: PlaceCandidate[],
    departureTime: string | undefined
): { candidates: PlaceCandidate[]; note: string | null } {
    const departureHour = parseTimeToHour(departureTime);

    if (departureHour === null) {
        return { candidates, note: null };
    }

    let note: string | null = null;

    // Morning departure: Add a note but don't filter candidates
    // (candidates are for swiping, not day-specific)
    if (departureHour < 12) {
        note = `Last day: Breakfast & Airport Transfer (${departureTime} departure)`;
    } else if (departureHour < 16) {
        // Early afternoon: Note about limited last day
        note = `Last day activities end by ${departureHour - 4}:00 (4-hour airport buffer)`;
    }

    return { candidates, note };
}

/**
 * Apply accommodation anchor to candidates
 * 
 * If accommodation is specified, add hotel info to metadata
 * for the UI to display starting point context.
 */
export function applyAccommodationAnchor(
    candidates: PlaceCandidate[],
    accommodation: LogisticsInput['accommodationDetails']
): { candidates: PlaceCandidate[]; note: string | null } {
    if (!accommodation?.hotelName) {
        return { candidates, note: null };
    }

    // Add accommodation context to first candidate
    const enhanced = candidates.map((candidate, index) => {
        if (index === 0) {
            return {
                ...candidate,
                accommodationAnchor: accommodation.hotelName,
                startingPoint: `Starting from ${accommodation.hotelName}`
            };
        }
        return candidate;
    });

    return {
        candidates: enhanced,
        note: `Base: ${accommodation.hotelName}`
    };
}

/**
 * Main entry point: Apply all logistics filters
 */
export function applyLogisticsFilters(
    candidates: PlaceCandidate[],
    logistics: LogisticsInput | undefined
): FilteredResult {
    if (!logistics) {
        return { candidates, scheduleNotes: [] };
    }

    const scheduleNotes: string[] = [];
    let result = candidates;

    // Apply arrival filter
    if (logistics.hasBookedFlights && logistics.flightDetails?.arrivalTime) {
        const { candidates: filtered, note } = applyArrivalFilter(
            result,
            logistics.flightDetails.arrivalTime
        );
        result = filtered;
        if (note) scheduleNotes.push(note);
    }

    // Apply departure filter
    if (logistics.hasBookedFlights && logistics.flightDetails?.departureTime) {
        const { candidates: filtered, note } = applyDepartureFilter(
            result,
            logistics.flightDetails.departureTime
        );
        result = filtered;
        if (note) scheduleNotes.push(note);
    }

    // Apply accommodation anchor
    if (logistics.hasBookedAccommodation && logistics.accommodationDetails) {
        const { candidates: filtered, note } = applyAccommodationAnchor(
            result,
            logistics.accommodationDetails
        );
        result = filtered;
        if (note) scheduleNotes.push(note);
    }

    console.log(`[LogisticsFilter] Applied filters. Notes: ${scheduleNotes.join(', ') || 'None'}`);

    return { candidates: result, scheduleNotes };
}
