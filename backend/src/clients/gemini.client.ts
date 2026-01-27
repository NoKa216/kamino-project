/**
 * Gemini AI Client
 * 
 * Responsibilities:
 * - Construct AI prompts for place discovery
 * - Execute Gemini API calls
 * - Parse and validate JSON responses
 * - Handle AI-specific errors
 */

import { model } from '../config/gemini';
import { PlaceCandidate, PlaceCategoryId, isValidCategory } from '../types/place.types';

// ============================================================================
// TYPES
// ============================================================================

export interface DiscoveryInput {
    destination: string;
    interests: string[];
    budget?: string;
    travelers?: string;
    mustHaveItems?: string[];
}

interface RawAICandidate {
    id: string;
    name: string;
    matchTag?: string;
    matchReason: string;
    suggestedCategory: string;
    description: string;
}

// ============================================================================
// PUBLIC API
// ============================================================================

export const GeminiClient = {
    /**
     * Generate place candidates using AI
     * Includes exponential backoff retry for transient errors (503, 429)
     * 
     * @param input - User preferences and trip context
     * @returns Array of AI-generated place candidates
     */
    generatePlaceCandidates: async (input: DiscoveryInput): Promise<Partial<PlaceCandidate>[]> => {
        const maxRetries = 3;
        let attempt = 0;
        const prompt = buildPrompt(input);

        while (attempt < maxRetries) {
            try {
                const result = await model.generateContent(prompt);
                const text = result.response
                    .text()
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();

                return parseAndValidate(text);
            } catch (error: any) {
                // Check if error is transient (503 Overloaded, 429 Rate Limit)
                const isTransient =
                    error?.status === 503 ||
                    error?.status === 429 ||
                    error?.message?.includes('503') ||
                    error?.message?.includes('Overloaded') ||
                    error?.message?.includes('overloaded') ||
                    error?.message?.includes('RESOURCE_EXHAUSTED');

                if (isTransient && attempt < maxRetries - 1) {
                    attempt++;
                    const delay = 1000 * Math.pow(2, attempt); // 2s, 4s, 8s
                    console.warn(`[Gemini] Model overloaded (503/429). Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error('[Gemini] Generation failed after retries:', error);
                    return [];
                }
            }
        }

        console.error('[Gemini] Service unavailable after maximum retries');
        return [];
    },

    /**
     * Generate text response for any prompt (used for itinerary generation, etc.)
     * Includes exponential backoff retry for transient errors (503, 429)
     * 
     * @param prompt - The prompt to send to Gemini
     * @returns Raw text response from AI
     */
    generateText: async (prompt: string): Promise<string> => {
        const maxRetries = 3;
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const result = await model.generateContent(prompt);
                const text = result.response
                    .text()
                    .replace(/```json/g, '')
                    .replace(/```/g, '')
                    .trim();
                return text; // Success! Return immediately
            } catch (error: any) {
                // Check if error is transient (503 Overloaded, 429 Rate Limit)
                const isTransient =
                    error?.status === 503 ||
                    error?.status === 429 ||
                    error?.message?.includes('503') ||
                    error?.message?.includes('Overloaded') ||
                    error?.message?.includes('overloaded') ||
                    error?.message?.includes('RESOURCE_EXHAUSTED');

                if (isTransient && attempt < maxRetries - 1) {
                    attempt++;
                    const delay = 1000 * Math.pow(2, attempt); // 2s, 4s, 8s
                    console.warn(`[Gemini] Model overloaded (503/429). Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    // Fatal error or out of retries
                    console.error('[Gemini] Text generation failed after retries:', error);
                    throw error;
                }
            }
        }

        throw new Error('[Gemini] Service unavailable after maximum retries');
    },
};

// ============================================================================
// PROMPT CONSTRUCTION
// ============================================================================

function buildPrompt(input: DiscoveryInput): string {
    const { destination, interests, budget, travelers, mustHaveItems } = input;

    const exclusionList = mustHaveItems && mustHaveItems.length > 0
        ? `EXCLUDE these places: ${mustHaveItems.join(', ')}.`
        : '';

    return `
I am planning a trip to ${destination} for a ${travelers || 'standard'} group.
Budget: ${budget || 'moderate'}.
Interests: ${interests.join(', ')}.
${exclusionList}

Please generate a list of **15 candidate places** to visit in ${destination}.

CRITICAL INSTRUCTIONS:
1. **ACCESSIBILITY**: EXCLUDE hotels, private clubs, or places where only guests can enter. Focus ONLY on publicly accessible attractions, restaurants, markets, parks, and landmarks.
2. **EXCLUSIONS**: Do not include any places listed in the exclusion list above.
3. **TAGS**: "matchTag" must be VERY SHORT (Max 5 words) + 1 Emoji explaining why it fits. Example: "🌊 Best for sunset lovers" or "🍕 Iconic cheap eats".
4. **REASONING**: "matchReason" must be a detailed explanation (2 sentences) connecting the place to the user's specific interests.
5. **CATEGORIES**: Analyze the place and assign it the **single most accurate category ID** from this specific list:
   
   **Food & Drink:**
   - 'foodie' (General nice restaurants)
   - 'wine' (Wineries, Wine bars)
   - 'coffee' (Cafes, Roasteries)
   - 'streetfood' (Markets, Food stalls)
   - 'beer' (Breweries, Pubs)

   **Nature & Outdoors:**
   - 'nature' (Scenic views, General nature)
   - 'beaches' (Coastlines, Beach clubs)
   - 'hiking' (Trails, Climbs)
   - 'water_sports' (Surfing, Diving spots)
   - 'parks' (Urban parks, Botanical gardens)

   **Urban & Culture:**
   - 'shopping' (Malls, Boutiques)
   - 'nightlife' (Clubs, Bars, Evening shows)
   - 'luxury' (High-end experiences)
   - 'architecture' (Landmarks known for design)
   - 'history' (Historical sites, Ruins)
   - 'museums' (Art galleries, Museums)
   - 'culture' (Local experiences, Neighborhoods)
   - 'music' (Live venues, Opera)
   - 'photography' (Instagrammable spots)

   **Activities:**
   - 'wellness' (Spas, Springs)
   - 'adventure' (Thrilling activities)
   - 'sports' (Stadiums, Active spots)

6. "description" should be short and punchy (marketing style).

Return STRICTLY JSON array of objects with this structure:
[{ "id": "slug-string", "name": "Place Name", "matchTag": "...", "matchReason": "...", "suggestedCategory": "category_id", "description": "..." }]
`;
}

// ============================================================================
// PARSING & VALIDATION
// ============================================================================

function parseAndValidate(text: string): Partial<PlaceCandidate>[] {
    try {
        // Attempt 1: Direct parse
        let parsed: unknown;
        try {
            parsed = JSON.parse(text);
        } catch {
            // Attempt 2: Extract JSON array using regex (for dirty LLM responses)
            const arrayMatch = text.match(/\[[\s\S]*\]/);
            if (!arrayMatch) {
                console.warn('[Gemini] Could not extract JSON array from response');
                return [];
            }
            parsed = JSON.parse(arrayMatch[0]);
        }

        if (!Array.isArray(parsed)) {
            console.warn('[Gemini] Response is not an array');
            return [];
        }

        // Validate and filter candidates
        return parsed
            .filter((candidate: RawAICandidate) => validateCandidate(candidate))
            .map((candidate: RawAICandidate) => ({
                id: candidate.id,
                name: candidate.name,
                matchTag: candidate.matchTag,
                matchReason: candidate.matchReason,
                suggestedCategory: candidate.suggestedCategory as PlaceCategoryId,
                description: candidate.description,
            }));
    } catch (error) {
        console.error('[Gemini] Failed to parse JSON:', { text: text.substring(0, 200), error });
        return [];
    }
}

function validateCandidate(candidate: RawAICandidate): boolean {
    if (!candidate.id || !candidate.name || !candidate.matchReason || !candidate.description) {
        console.warn('[Gemini] Invalid candidate (missing required fields):', candidate);
        return false;
    }

    if (!isValidCategory(candidate.suggestedCategory)) {
        console.warn('[Gemini] Invalid category:', candidate.suggestedCategory);
        return false;
    }

    return true;
}
