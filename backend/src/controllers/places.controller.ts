import { Request, Response } from 'express';
import axios from 'axios';
import { z } from 'zod';

// --- Validation Schema ---
const SearchQuerySchema = z.object({
    q: z.string().min(2),
    type: z.enum(['city', 'attraction']).optional().default('city')
});

export const searchPlaces = async (req: Request, res: Response) => {
    try {
        const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
        const { q, type } = SearchQuerySchema.parse(req.query);

        const isEnglish = /^[a-zA-Z0-9\s\-\,\.]+$/.test(q);

        if (!isEnglish) {
            return res.json([]);
        }

        if (!GOOGLE_PLACES_API_KEY) {
            console.warn("⚠️ [PlacesController] No API Key. Returning Mock.");
            return res.json(getMockData(q, type));
        }

        // --- API CONFIGURATION ---
        const googleUrl = `https://places.googleapis.com/v1/places:autocomplete`;

        const includedPrimaryTypes = type === 'city'
            ? ['locality', 'administrative_area_level_1', 'country']
            : ['tourist_attraction', 'landmark', 'place_of_worship', 'museum', 'park'];

        const response = await axios.post(
            googleUrl,
            {
                input: q,
                includedPrimaryTypes: includedPrimaryTypes,
                languageCode: 'en'
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
                },
            }
        );

        const suggestions = response.data.suggestions || [];

        const formattedResults = suggestions.map((item: any) => {
            const place = item.placePrediction;
            return {
                placeId: place.placeId,
                description: place.text.text,
                mainText: place.structuredFormat?.mainText?.text || place.text.text,
                secondaryText: place.structuredFormat?.secondaryText?.text || ''
            };
        });

        res.json(formattedResults);

    } catch (error: any) {
        if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors });

        console.error("[PlacesController] Error:", error.response?.data || error.message);
        // Fallback to mock on error
        res.json(getMockData(req.query.q as string, req.query.type as any));
    }
};

// --- Mock Data ---
const getMockData = (query: string, type: string) => {
    const q = query.toLowerCase();
    if (type === 'city') {
        const cities = [
            { placeId: '1', description: 'Paris, France', mainText: 'Paris', secondaryText: 'France' },
            { placeId: '2', description: 'Tel Aviv-Yafo, Israel', mainText: 'Tel Aviv', secondaryText: 'Israel' },
            { placeId: '3', description: 'New York, NY, USA', mainText: 'New York', secondaryText: 'NY, USA' },
            { placeId: '4', description: 'Tokyo, Japan', mainText: 'Tokyo', secondaryText: 'Japan' },
        ];
        return cities.filter(c => c.mainText.toLowerCase().includes(q));
    } else {
        const attractions = [
            { placeId: '10', description: 'Eiffel Tower, Paris', mainText: 'Eiffel Tower', secondaryText: 'Paris' },
            { placeId: '11', description: 'Louvre Museum, Paris', mainText: 'Louvre Museum', secondaryText: 'Paris' },
        ];
        return attractions.filter(a => a.mainText.toLowerCase().includes(q));
    }
};