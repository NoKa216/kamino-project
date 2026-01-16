import { Request, Response } from 'express';
import axios from 'axios';
import { z } from 'zod';

// --- Validation Schema ---
const SearchQuerySchema = z.object({
    q: z.string().min(2),
    type: z.enum(['city', 'attraction', 'lodging']).optional().default('city')
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

        // Select appropriate primary types based on search type
        let includedPrimaryTypes: string[];
        if (type === 'city') {
            includedPrimaryTypes = ['locality', 'administrative_area_level_1', 'country'];
        } else if (type === 'lodging') {
            includedPrimaryTypes = ['lodging', 'hotel', 'motel', 'resort_hotel', 'extended_stay_hotel'];
        } else {
            // attraction
            includedPrimaryTypes = ['tourist_attraction', 'landmark', 'place_of_worship', 'museum', 'park'];
        }

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
    const q = query?.toLowerCase() || '';
    if (type === 'city') {
        const cities = [
            { placeId: '1', description: 'Paris, France', mainText: 'Paris', secondaryText: 'France' },
            { placeId: '2', description: 'Tel Aviv-Yafo, Israel', mainText: 'Tel Aviv', secondaryText: 'Israel' },
            { placeId: '3', description: 'New York, NY, USA', mainText: 'New York', secondaryText: 'NY, USA' },
            { placeId: '4', description: 'Tokyo, Japan', mainText: 'Tokyo', secondaryText: 'Japan' },
        ];
        return cities.filter(c => c.mainText.toLowerCase().includes(q));
    } else if (type === 'lodging') {
        const hotels = [
            { placeId: 'h1', description: 'The Ritz Paris, Paris, France', mainText: 'The Ritz Paris', secondaryText: 'Paris, France' },
            { placeId: 'h2', description: 'Park Hyatt Tokyo, Tokyo, Japan', mainText: 'Park Hyatt Tokyo', secondaryText: 'Tokyo, Japan' },
            { placeId: 'h3', description: 'The Plaza Hotel, New York, USA', mainText: 'The Plaza Hotel', secondaryText: 'New York, USA' },
            { placeId: 'h4', description: 'Hilton Tel Aviv, Israel', mainText: 'Hilton Tel Aviv', secondaryText: 'Tel Aviv, Israel' },
        ];
        return hotels.filter(h => h.mainText.toLowerCase().includes(q) || h.secondaryText.toLowerCase().includes(q));
    } else {
        const attractions = [
            { placeId: '10', description: 'Eiffel Tower, Paris', mainText: 'Eiffel Tower', secondaryText: 'Paris' },
            { placeId: '11', description: 'Louvre Museum, Paris', mainText: 'Louvre Museum', secondaryText: 'Paris' },
        ];
        return attractions.filter(a => a.mainText.toLowerCase().includes(q));
    }
};

/**
 * Secure Image Proxy - Stream photos from Google Places API
 * Keeps API key server-side, never exposed to client
 * 
 * @route GET /api/places/photo/:reference
 */
export const proxyPlacePhoto = async (req: Request, res: Response) => {
    try {
        const { reference } = req.params;
        const maxWidth = parseInt(req.query.maxWidth as string) || 1000;

        const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

        if (!GOOGLE_PLACES_API_KEY) {
            res.status(500).json({ error: 'API key not configured' });
            return;
        }

        if (!reference || reference.length < 10) {
            res.status(400).json({ error: 'Invalid photo reference' });
            return;
        }

        // Construct Google Places Photo URL
        const photoUrl = `https://places.googleapis.com/v1/${reference}/media?key=${GOOGLE_PLACES_API_KEY}&maxWidthPx=${maxWidth}`;

        // Stream the image from Google to client
        const response = await axios.get(photoUrl, {
            responseType: 'stream',
            timeout: 10000,
        });

        // Forward content-type header
        res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24h

        // Pipe the image stream to response
        response.data.pipe(res);

    } catch (error: any) {
        console.error('[PhotoProxy] Error:', error.response?.status || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch photo' });
    }
};