/**
 * Itinerary Prompts Utility
 * 
 * Responsibility: AI prompt engineering for itinerary generation.
 * Contains the complex prompt templates for Gemini AI that implement:
 * - Persona Analysis (pattern recognition from likes/dislikes)
 * - Demographic Matching (traveler type + budget heuristics)
 * - Smart Completion (AI-suggested places)
 * 
 * @module utils/ai/itineraryPrompts
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Place data used for prompt construction
 */
export interface PlaceSignal {
    id: string;
    name: string;
    suggestedCategory?: string;
    matchReason?: string;
}

/**
 * Trip context for prompt construction
 */
export interface TripContext {
    destination: string;
    startDate: string;
    endDate: string;
    travelers: string;
    budget: string;
    arrivalTime?: string;
    departureTime?: string;
    hotelName?: string;
}

// ============================================================================
// PROMPT CONSTRUCTION
// ============================================================================

/**
 * Constructs the AI prompt for itinerary generation.
 * 
 * This prompt implements a sophisticated personalization strategy:
 * 1. Mandatory Anchors: All liked places MUST be included
 * 2. Persona Analysis: Pattern recognition from preferences
 * 3. Demographic Matching: Collaborative filtering based on traveler profile
 * 4. Smart Completion: AI fills gaps with contextually appropriate suggestions
 * 
 * @param likedPlaces - Places the user swiped right on (positive signals)
 * @param dislikedPlaces - Places the user swiped left on (negative signals)
 * @param context - Trip metadata (dates, travelers, budget, logistics)
 * @returns Formatted prompt string for Gemini AI
 */
export function constructItineraryPrompt(
    likedPlaces: PlaceSignal[],
    dislikedPlaces: PlaceSignal[],
    context: TripContext
): string {
    const positiveSignals = likedPlaces.map((p, i) =>
        `${i + 1}. ${p.name} [${p.suggestedCategory || 'Activity'}] - "${p.matchReason || 'User liked this place'}"`
    ).join('\n');

    const negativeSignals = dislikedPlaces.length > 0
        ? dislikedPlaces.map((p, i) =>
            `${i + 1}. ${p.name} [${p.suggestedCategory || 'unknown'}]`
        ).join('\n')
        : 'None provided';

    // Extract category patterns for persona analysis
    const likedCategories = [...new Set(likedPlaces.map(p => p.suggestedCategory).filter(Boolean))];
    const dislikedCategories = [...new Set(dislikedPlaces.map(p => p.suggestedCategory).filter(Boolean))];

    return `
You are an elite Travel Curator. Create a deeply personalized day-by-day itinerary for this trip.

═══════════════════════════════════════════════════════════════
TRIP DETAILS
═══════════════════════════════════════════════════════════════
- Destination: ${context.destination}
- Start Date: ${context.startDate}
- End Date: ${context.endDate}
- Travelers: ${context.travelers}
- Budget: ${context.budget}
${context.arrivalTime ? `- Arrival Time: ${context.arrivalTime}` : ''}
${context.departureTime ? `- Departure Time: ${context.departureTime}` : ''}
${context.hotelName ? `- Accommodation: ${context.hotelName}` : ''}

═══════════════════════════════════════════════════════════════
USER'S POSITIVE SIGNALS (MUST INCLUDE - These are the anchors)
═══════════════════════════════════════════════════════════════
${positiveSignals}

Liked Categories Pattern: ${likedCategories.join(', ') || 'Mixed'}

═══════════════════════════════════════════════════════════════
USER'S NEGATIVE SIGNALS (AVOID THIS STYLE)
═══════════════════════════════════════════════════════════════
${negativeSignals}

Rejected Categories Pattern: ${dislikedCategories.join(', ') || 'None'}

═══════════════════════════════════════════════════════════════
YOUR MISSION
═══════════════════════════════════════════════════════════════

1. **MANDATORY ANCHORS**: 
   You MUST include EVERY SINGLE place from the "Positive Signals" list above.
   These are the pillars of the trip - non-negotiable.

2. **PERSONA ANALYSIS** (Think before you plan):
   - Analyze the PATTERN: What links the Liked places? 
     Examples: "Quiet Luxury", "Hardcore History Buff", "Local Foodie", "Adventure Seeker"
   - Analyze the CONTRAST: What did they reject and why?
     Example: If they liked a Jazz Bar but disliked a Techno Club → they want nightlife but hate loud/crowded
     Example: If they liked a Museum but disliked a Tourist Trap → they want culture without crowds

3. **DEMOGRAPHIC MATCHING** (The "People Like You" Logic):
   - You are planning for: **${context.travelers}** | Budget: **${context.budget}**
   - Use your global training data to filter recommendations based on this profile.
   - Apply these heuristics when choosing "Smart Completion" places:
     * "Couple" + "Luxury" → Intimate, high-service experiences; avoid crowded family spots
     * "Couple" + "Budget" → Romantic but affordable: sunset viewpoints, local markets, cozy cafés
     * "Family" + "Budget" → Parks, free attractions, kid-friendly restaurants
     * "Family" + "Luxury" → Premium family resorts, private tours, fine dining with kids menu
     * "Solo" + Any → Independent exploration: walking neighborhoods, solo-friendly bars, street food
     * "Friends" + "Nightlife interest" → Group-friendly bars, clubs, rooftop terraces
   - OVERRIDE generic suggestions with demographically appropriate alternatives.

4. **SMART COMPLETION**:
   - Fill remaining time slots with 3-5 NEW recommendations that fit BOTH the persona AND demographic
   - Do NOT suggest places similar to the "Negative Signals" categories or vibe
   - Connect the dots: geographically (nearby) and thematically (matching vibe)
   - Add: hidden cafés, scenic viewpoints, local restaurants, unique experiences

5. **LABELING**:
   - User's original selections: "isAISuggestion": false
   - YOUR new suggestions: "isAISuggestion": true + add "(AI Recommendation)" in notes

6. **LOGISTICS**:
   - Group nearby places to minimize travel
   - Respect opening hours and best visit times
   - Include realistic meal breaks
   - Add travel tips and durations between spots

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT (Strictly JSON)
═══════════════════════════════════════════════════════════════
{
  "userPersona": "One sentence describing the traveler's style based on your analysis",
  "days": [
    {
      "date": "YYYY-MM-DD",
      "dayNumber": 1,
      "theme": "Day theme (e.g., 'Historic Heart', 'Foodie Paradise')",
      "activities": [
        {
          "time": "09:00",
          "placeId": "place_id_or_slug",
          "placeName": "Place Name",
          "category": "category_id",
          "duration": "2 hours",
          "notes": "Tips, context, or (AI Recommendation)",
          "isAISuggestion": false
        }
      ]
    }
  ],
  "summary": "A compelling 2-sentence summary of this personalized adventure"
}
`.trim();
}
