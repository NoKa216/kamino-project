import React from 'react';
import { Loader } from '../components/ui/Loader';

import { Redirect } from 'expo-router';

const DEV_MODE_SWIPE = false;

/**
 * Root Index
 * Serves as a placeholder while the RootLayout handles the redirect logic.
 * Uses the custom Loader to maintain visual consistency.
 */
export default function RootIndex() {

    if (DEV_MODE_SWIPE) {
        return (
            <Redirect
                href={{
                    pathname: "/(app)/trip/[id]/swipe",
                    params: {
                        id: "test-trip-123", // ID פיקטיבי
                        candidates: JSON.stringify(MOCK_CANDIDATES) // מעבירים את הנתונים
                    }
                }}
            />
        );
    }

    return <Loader />;
}



// src/constants/MOCK_DATA.ts

export const MOCK_CANDIDATES = [
    {
        id: "1",
        name: "Borough Market",
        matchReason: "Perfect for Street Food lovers",
        suggestedCategory: "streetfood",
        description: "London's most iconic food market serving up global flavors under historic railway arches.",
        location: "London, UK",
        rating: 4.8,
        userRatingCount: 15420,
        photos: [
            "https://images.unsplash.com/photo-1679966395114-671e12f3a54d?q=80&w=1000", // Market stall
            "https://images.unsplash.com/photo-1679966395114-671e12f3a54d?q=80&w=1000", // Crowd & Vibe
            "https://images.unsplash.com/photo-1679966395114-671e12f3a54d?q=80&w=1000", // Fresh produce
            "https://images.unsplash.com/photo-1679966395114-671e12f3a54d?q=80&w=1000", // Cheese/Bread
            "https://images.unsplash.com/photo-1679966395114-671e12f3a54d?q=80&w=1000"  // Cooking action
        ]
    },
    {
        id: "2",
        name: "Liberty London",
        matchReason: "Iconic architecture & Luxury shopping",
        suggestedCategory: "shopping",
        description: "A luxury department store housed in a breathtaking timber-framed building from the 1920s.",
        location: "London, UK",
        rating: 4.7,
        userRatingCount: 8900,
        photos: [
            "https://images.unsplash.com/photo-1541627932644-8c014798622c?q=80&w=1000", // Exterior Front
            "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1000", // Interior wood
            "https://images.unsplash.com/photo-1554807469-d5a239b56f21?q=80&w=1000", // Flower shop outside
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000", // Fashion display
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000"  // Shopping vibe
        ]
    },
    {
        id: "3",
        name: "Eiffel Tower",
        matchReason: "Must-see landmark",
        suggestedCategory: "history",
        description: "The Iron Lady offering the best views of Paris, especially dazzling at night.",
        location: "Paris, France",
        rating: 4.6,
        userRatingCount: 320500,
        photos: [
            "https://images.unsplash.com/photo-1570097703229-b195d6dd291f?q=80&w=1000", // Classic view
            "https://images.unsplash.com/photo-1570097703229-b195d6dd291f?q=80&w=1000", // Night lights
            "https://images.unsplash.com/photo-1570097703229-b195d6dd291f?q=80&w=1000", // From street
            "https://images.unsplash.com/photo-1570097703229-b195d6dd291f?q=80&w=1000", // Picnic nearby
            "https://images.unsplash.com/photo-1570097703229-b195d6dd291f?q=80&w=1000"  // View from top
        ]
    }
];