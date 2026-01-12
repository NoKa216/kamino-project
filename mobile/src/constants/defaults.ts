/**
 * Frontend Constants: Default Values & Fallbacks
 * Centralized configuration for consistent UI behavior
 */

import { PlaceCategoryId, CategoryMetadata } from '../../../shared/types/place.types';

/**
 * Default fallback image for places without photos
 * Using Unsplash's travel/destination image
 */
export const DEFAULT_PLACE_IMAGE =
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop';

/**
 * Default fallback image for static maps
 * Using Unsplash's map/location image
 */
export const DEFAULT_MAP_IMAGE =
    'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000';

/**
 * Category metadata for UI display
 * Provides display names, emojis, and default tags for each category
 */
export const CATEGORY_METADATA: Record<PlaceCategoryId, CategoryMetadata> = {
    // Food & Drink
    foodie: {
        id: 'foodie',
        displayName: 'Fine Dining',
        emoji: '🍽️',
        defaultTags: ['Must See', 'Popular', 'Foodie Heaven'],
    },
    wine: {
        id: 'wine',
        displayName: 'Wine & Spirits',
        emoji: '🍷',
        defaultTags: ['Must See', 'Popular', 'Wine Lover', 'Romantic'],
    },
    coffee: {
        id: 'coffee',
        displayName: 'Coffee Culture',
        emoji: '☕',
        defaultTags: ['Must See', 'Popular', 'Cozy', 'Instagram-worthy'],
    },
    streetfood: {
        id: 'streetfood',
        displayName: 'Street Food',
        emoji: '🌮',
        defaultTags: ['Must See', 'Popular', 'Local Vibe', 'Cheap Eats'],
    },
    beer: {
        id: 'beer',
        displayName: 'Craft Beer',
        emoji: '🍺',
        defaultTags: ['Must See', 'Popular', 'Nightlife', 'Social'],
    },

    // Nature & Outdoors
    nature: {
        id: 'nature',
        displayName: 'Nature & Scenery',
        emoji: '🌄',
        defaultTags: ['Must See', 'Popular', 'Scenic', 'Peaceful'],
    },
    beaches: {
        id: 'beaches',
        displayName: 'Beaches',
        emoji: '🏖️',
        defaultTags: ['Must See', 'Popular', 'Relaxing', 'Summer Vibes'],
    },
    hiking: {
        id: 'hiking',
        displayName: 'Hiking & Trails',
        emoji: '🥾',
        defaultTags: ['Must See', 'Popular', 'Adventure', 'Active'],
    },
    water_sports: {
        id: 'water_sports',
        displayName: 'Water Sports',
        emoji: '🏄',
        defaultTags: ['Must See', 'Popular', 'Thrilling', 'Summer'],
    },
    parks: {
        id: 'parks',
        displayName: 'Parks & Gardens',
        emoji: '🌳',
        defaultTags: ['Must See', 'Popular', 'Family-Friendly', 'Relaxing'],
    },

    // Urban & Culture
    shopping: {
        id: 'shopping',
        displayName: 'Shopping',
        emoji: '🛍️',
        defaultTags: ['Must See', 'Popular', 'Trendy', 'Luxury'],
    },
    nightlife: {
        id: 'nightlife',
        displayName: 'Nightlife',
        emoji: '🎉',
        defaultTags: ['Must See', 'Popular', 'Party', 'Social'],
    },
    luxury: {
        id: 'luxury',
        displayName: 'Luxury Experience',
        emoji: '💎',
        defaultTags: ['Must See', 'Popular', 'Exclusive', 'Premium'],
    },
    architecture: {
        id: 'architecture',
        displayName: 'Architecture',
        emoji: '🏛️',
        defaultTags: ['Must See', 'Popular', 'Historic', 'Iconic'],
    },
    history: {
        id: 'history',
        displayName: 'History & Heritage',
        emoji: '📜',
        defaultTags: ['Must See', 'Popular', 'Educational', 'Cultural'],
    },
    museums: {
        id: 'museums',
        displayName: 'Museums & Art',
        emoji: '🎨',
        defaultTags: ['Must See', 'Popular', 'Art', 'History', 'Quiet'],
    },
    culture: {
        id: 'culture',
        displayName: 'Local Culture',
        emoji: '🎭',
        defaultTags: ['Must See', 'Popular', 'Authentic', 'Local'],
    },
    music: {
        id: 'music',
        displayName: 'Music & Shows',
        emoji: '🎵',
        defaultTags: ['Must See', 'Popular', 'Entertainment', 'Nightlife'],
    },
    photography: {
        id: 'photography',
        displayName: 'Photo Spots',
        emoji: '📸',
        defaultTags: ['Must See', 'Popular', 'Instagrammable', 'Scenic'],
    },

    // Activities
    wellness: {
        id: 'wellness',
        displayName: 'Wellness & Spa',
        emoji: '🧘',
        defaultTags: ['Must See', 'Popular', 'Relaxing', 'Rejuvenating'],
    },
    adventure: {
        id: 'adventure',
        displayName: 'Adventure',
        emoji: '🪂',
        defaultTags: ['Must See', 'Popular', 'Thrilling', 'Adrenaline'],
    },
    sports: {
        id: 'sports',
        displayName: 'Sports & Games',
        emoji: '⚽',
        defaultTags: ['Must See', 'Popular', 'Active', 'Exciting'],
    },
};

/**
 * Helper to get tags for a category
 */
export function getTagsForCategory(category: PlaceCategoryId): string[] {
    return CATEGORY_METADATA[category]?.defaultTags || ['Must See', 'Popular', 'Tourist Favorite'];
}

/**
 * Helper to get category display name with emoji
 */
export function getCategoryDisplay(category: PlaceCategoryId): string {
    const metadata = CATEGORY_METADATA[category];
    if (!metadata) return category;
    return `${metadata.emoji} ${metadata.displayName}`;
}

/**
 * Default rating and review count for places without data
 */
export const DEFAULT_RATING = 4.8;
export const DEFAULT_REVIEW_COUNT = '2.4k';
