/**
 * AI Curator Generator
 * 
 * Single Responsibility: Generate place candidates using Gemini AI
 * 
 * This service implements the "Travel Curator" persona that creates
 * a diverse mix of Hidden Gems, Icons, and Vibe spots.
 */

import { model } from '../../config/gemini';
import { PlaceCandidate } from '../../types/place.types';

export interface CuratorInput {
    destination: string;
    interests: string[];
    budget?: string;
    travelers?: string;
    mustHaveItems?: string[];
}

/**
 * Generates AI-curated place candidates with enforced diversity
 */
export async function generateCuratedCandidates(
    input: CuratorInput,
    count: number
): Promise<Partial<PlaceCandidate>[]> {
    const { destination, interests, budget, travelers, mustHaveItems } = input;
    const exclusionList = mustHaveItems && mustHaveItems.length > 0
        ? `EXCLUDE these places: ${mustHaveItems.join(', ')}.` : '';

    const prompt = `
Role: You are an elite Travel Curator for a high-end travel app. 
Your goal is to build a diverse "Tasting Menu" of ${destination}.

User Profile:
- Group: ${travelers || 'Any'}
- Budget: ${budget || 'Moderate'}
- Interests: ${interests.join(', ')}
${exclusionList}

Task: Generate exactly ${count} DISTINCT candidate places.

CRITICAL - THE MIX (Diversity Rule):
- 40% HIDDEN GEMS: Unknown to tourists, loved by locals. (Tests if user is adventurous).
- 30% ICONS: Major landmarks but with a unique twist/tip. (Tests if user likes classics).
- 30% VIBE: Cool bars, street food, or view spots. (Tests specific taste).

STRICT GUIDELINES:
1. ❌ NO HOTELS. NO CLOSED CLUBS. Only publicly accessible places.
2. ✍️ WRITE LIKE A HUMAN: 
   - "matchTag": Fun, short, punchy + Emoji. (e.g., "🍕 Best Slice in NYC", not "Pizza Restaurant").
   - "matchReason": Connect it PERSONALLY to the user's specific interests. Don't be generic.
3. 🎯 CATEGORIES: Pick the single most accurate ID from:
   [foodie, wine, coffee, streetfood, beer, nature, beaches, hiking, water_sports, parks, shopping, nightlife, luxury, architecture, history, museums, culture, music, photography, wellness, adventure, sports]

4. 🔍 REALITY CHECK: Ensure the place actually exists.

Return STRICTLY JSON array:
[{ "id": "slug-string", "name": "Exact Place Name", "matchTag": "...", "matchReason": "...", "suggestedCategory": "...", "description": "..." }]
`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error('[AI] Generation failed:', error);
        return [];
    }
}
