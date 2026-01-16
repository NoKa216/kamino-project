/**
 * Curated Destination Images
 * 
 * High-quality, iconic hero images for top global destinations.
 * Used as first priority before falling back to dynamic API fetches.
 * 
 * Image Sources: Unsplash (royalty-free, high-resolution)
 * Format: Portrait/vertical aspect ratio optimized for mobile cards
 */

// Type for the mapping
type DestinationImageMap = Record<string, string>;

/**
 * Curated images for major destinations
 * Keys: Normalized city names (lowercase, trimmed)
 * Values: High-quality Unsplash URLs with specific photo IDs
 */
export const CURATED_DESTINATION_IMAGES: DestinationImageMap = {
    // --- Europe ---
    'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80', // Eiffel Tower sunset
    'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80', // Tower Bridge
    'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80', // Colosseum
    'barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80', // Sagrada Familia
    'amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&q=80', // Canals
    'prague': 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&q=80', // Old Town
    'vienna': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=1200&q=80', // Palace
    'lisbon': 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=1200&q=80', // Tram 28
    'berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1200&q=80', // Brandenburg Gate
    'athens': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&q=80', // Acropolis
    'santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80', // Blue domes

    // --- Asia ---
    'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80', // Shibuya crossing
    'kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80', // Fushimi Inari
    'bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=80', // Temples
    'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80', // Marina Bay
    'hong kong': 'https://images.unsplash.com/photo-1536599018102-9f803c979e4e?w=1200&q=80', // Skyline
    'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80', // Rice terraces
    'seoul': 'https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200&q=80', // Gyeongbokgung

    // --- Middle East ---
    'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80', // Burj Khalifa
    'tel aviv': 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=1200&q=80', // Beach promenade
    'jerusalem': 'https://images.unsplash.com/photo-1552423314-cf29ab68ad73?w=1200&q=80', // Old City

    // --- Americas ---
    'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&q=80', // Skyline
    'los angeles': 'https://images.unsplash.com/photo-1534190760961-74e8c1c5c3da?w=1200&q=80', // Hollywood
    'miami': 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=1200&q=80', // South Beach
    'san francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80', // Golden Gate
    'las vegas': 'https://images.unsplash.com/photo-1605833556294-ea5c7a74f57d?w=1200&q=80', // Strip
    'cancun': 'https://images.unsplash.com/photo-1552074284-5e88ef1aef18?w=1200&q=80', // Beach
    'rio de janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&q=80', // Christ Redeemer
    'buenos aires': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=1200&q=80', // La Boca

    // --- Oceania ---
    'sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&q=80', // Opera House
    'melbourne': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=1200&q=80', // Laneways

    // --- Africa ---
    'cape town': 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1200&q=80', // Table Mountain
    'marrakech': 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=1200&q=80', // Medina
};

/**
 * Get curated image URL for a destination
 * 
 * @param destination - City name (case-insensitive)
 * @returns Curated image URL or undefined if not found
 */
export function getCuratedImage(destination: string): string | undefined {
    if (!destination) return undefined;

    // Normalize: lowercase, trim, extract city name (before first comma)
    const cityName = destination.split(',')[0].toLowerCase().trim();

    return CURATED_DESTINATION_IMAGES[cityName];
}

/**
 * Check if a destination has a curated image
 */
export function hasCuratedImage(destination: string): boolean {
    return getCuratedImage(destination) !== undefined;
}
