import { model } from '../config/gemini';
import { db } from '../config/firebase';
import axios from 'axios';

interface PlaceCandidate {
    id: string;
    name: string;
    matchTag?: string;    // תגית קצרה + אימוג'י (לקלף)
    matchReason: string;  // הסבר מפורט (למודל)
    suggestedCategory: string;
    description: string;
    coordinates?: { lat: number; lng: number }; // המבנה התקין למפה
    photos?: string[];
    googlePlaceId?: string;
    rating?: number | null;
    userRatingCount?: number | null;
    location?: string; // הכתובת המלאה מגוגל
    openingHours?: {
        openNow: boolean;
        weekdayText: string[];
    } | null;
}

interface DiscoveryInput {
    destination: string;
    interests: string[];
    budget?: string;
    travelers?: string;
    mustHaveItems?: string[];
}

export const PlaceDiscoveryService = {
    generateCandidates: async (input: DiscoveryInput): Promise<PlaceCandidate[]> => {
        try {
            console.log(`[PlaceDiscovery] Starting generation for ${input.destination}...`);

            // 1. Generate Candidates via Gemini
            const aiCandidates = await generateAICandidates(input);
            console.log(`[PlaceDiscovery] AI generated ${aiCandidates.length} candidates.`);

            // 2. Enrich Data (Hybrid Loop)
            const enrichedCandidates = await enrichCandidates(aiCandidates, input.destination);

            return enrichedCandidates;
        } catch (error) {
            console.error("[PlaceDiscovery] Error:", error);
            throw error;
        }
    }
};

async function generateAICandidates(input: DiscoveryInput): Promise<PlaceCandidate[]> {
    const { destination, interests, budget, travelers, mustHaveItems } = input;
    const exclusionList = mustHaveItems && mustHaveItems.length > 0
        ? `EXCLUDE these places: ${mustHaveItems.join(', ')}.`
        : '';

    // --- פרומפט משולב ומדויק ---
    const prompt = `
    I am planning a trip to ${destination} for a ${travelers || 'standard'} group.
    Budget: ${budget || 'moderate'}.
    Interests: ${interests.join(', ')}.
    ${exclusionList}

    Please generate a list of **7 candidate places** to visit in ${destination}.
    
    CRITICAL INSTRUCTIONS:
    1. **ACCESSIBILITY**: EXCLUDE hotels, private clubs, or places where only guests can enter. Focus ONLY on publicly accessible attractions, restaurants, markets, parks, and landmarks.
    2. **EXCLUSIONS**: Do not include any places listed in the exclusion list above.
    3. **TAGS**: "matchTag" must be VERY SHORT (Max 5 words) + 1 Emoji. Example: "🌊 Best for sunset lovers".
    4. **REASONING**: "matchReason" must be a detailed explanation (2 sentences) connecting the place to the user's specific interests.
    5. **CATEGORIES**: Analyze the place and assign it the **single most accurate category ID** from this list:
       
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

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();

    try {
        const parsed = JSON.parse(text);
        return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
        console.error("Failed to parse AI response", text);
        return [];
    }
}

async function enrichCandidates(candidates: PlaceCandidate[], destinationContext: string): Promise<PlaceCandidate[]> {
    const enriched: PlaceCandidate[] = [];

    for (const candidate of candidates) {
        try {
            const normalizedName = candidate.name.toLowerCase().trim();

            // 1. בדיקה ב-Cache
            const existingDocs = await db.collection('places')
                .where('normalizedName', '==', normalizedName)
                .where('cityContext', '==', destinationContext.toLowerCase())
                .limit(1)
                .get();

            if (!existingDocs.empty) {
                const docData = existingDocs.docs[0].data();
                enriched.push({
                    ...candidate,
                    // שליפת הנתונים מה-DB
                    coordinates: docData.location, // נשמר כאובייקט lat/lng תקין
                    location: docData.formattedAddress || candidate.name,
                    photos: docData.photos || [],
                    googlePlaceId: docData.googlePlaceId,
                    rating: docData.rating,
                    userRatingCount: docData.userRatingCount,
                    openingHours: docData.openingHours || null,
                    matchTag: candidate.matchTag, // מה-AI החדש
                    matchReason: candidate.matchReason // מה-AI החדש
                });
                console.log(`[PlaceDiscovery] Cache Hit: ${candidate.name}`);
                continue;
            }

            // 2. משיכה מגוגל
            console.log(`[PlaceDiscovery] Cache Miss: ${candidate.name}. Fetching from Google...`);
            const googleData = await fetchGooglePlaceData(`${candidate.name} in ${destinationContext}`);

            if (googleData) {
                const photoUrls: string[] = [];
                if (googleData.photos && googleData.photos.length > 0) {
                    const photosToFetch = googleData.photos.slice(0, 5);
                    photosToFetch.forEach((photo: any) => {
                        photoUrls.push(`https://places.googleapis.com/v1/${photo.name}/media?key=${process.env.GOOGLE_PLACES_API_KEY}&maxWidthPx=1000`);
                    });
                }

                // המרה קריטית של הקואורדינטות (latitude -> lat)
                const coordinates = googleData.location ? {
                    lat: googleData.location.latitude,
                    lng: googleData.location.longitude
                } : undefined;

                const openingHours = googleData.regularOpeningHours ? {
                    openNow: googleData.regularOpeningHours.openNow,
                    weekdayText: googleData.regularOpeningHours.weekdayDescriptions || []
                } : null;

                const enrichedCandidate: PlaceCandidate = {
                    ...candidate,
                    coordinates: coordinates,
                    location: googleData.formattedAddress, // הכתובת המדויקת
                    googlePlaceId: googleData.id,
                    photos: photoUrls,
                    rating: googleData.rating || null,
                    userRatingCount: googleData.userRatingCount || null,
                    openingHours: openingHours
                };

                enriched.push(enrichedCandidate);

                // שמירה ב-DB
                await db.collection('places').add({
                    name: candidate.name,
                    normalizedName: normalizedName,
                    cityContext: destinationContext.toLowerCase(),
                    location: coordinates, // שומרים מבנה תקין למפה
                    formattedAddress: googleData.formattedAddress,
                    editorialSummary: googleData.editorialSummary?.text || candidate.description,
                    photos: photoUrls,
                    rating: googleData.rating || null,
                    userRatingCount: googleData.userRatingCount || null,
                    openingHours: openingHours,
                    createdAt: new Date().toISOString()
                });
            } else {
                enriched.push(candidate);
            }

        } catch (e) {
            console.error(`[PlaceDiscovery] Failed to enrich ${candidate.name}:`, e);
            enriched.push(candidate);
        }
    }
    return enriched;
}

async function fetchGooglePlaceData(query: string) {
    if (!process.env.GOOGLE_PLACES_API_KEY) return null;
    try {
        const response = await axios.post(
            'https://places.googleapis.com/v1/places:searchText',
            { textQuery: query, maxResultCount: 1 },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
                    'X-Goog-FieldMask': 'places.id,places.location,places.formattedAddress,places.photos,places.editorialSummary,places.rating,places.userRatingCount,places.regularOpeningHours'
                }
            }
        );
        return response.data.places?.[0] || null;
    } catch (e) {
        console.error("Google API Error", e);
        return null;
    }
}