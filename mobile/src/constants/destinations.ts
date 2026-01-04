export interface Landmark {
    name: string;
    image: string;
}

export interface Destination {
    id: string;
    name: string;
    location: string;
    imageUri: string;
    description: string;
    rating: number;
    tags: string[];
    duration: string;
    costLevel: '$$' | '$$$' | '$$$$' | '$$$$$';
    bestSeason: string;
    weather: string;
    // --- NEW FIELDS ---
    currency: string; // e.g. "Euro (€)"
    voltage: string;  // e.g. "230V (Type C)"
    landmarks: Landmark[];
}

const MOCK_DESCRIPTION = "Experience the ultimate luxury getaway where crystal clear waters meet dramatic landscapes. Indulge in world-class cuisine, breathtaking views, and exclusive private experiences designed for pure relaxation.";

const DEFAULT_LANDMARKS = [
    { name: 'Local Hidden Gem', image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=600&auto=format&fit=crop' },
    { name: 'Historic Old Town', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=600&auto=format&fit=crop' },
    { name: 'Famous Market', image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=600&auto=format&fit=crop' },
];

/**
 * Helper function to enrich destination data with defaults.
 */
const enrich = (dest: Partial<Destination> & { id: string, name: string, location: string, imageUri: string }, overrides: Partial<Destination> = {}): Destination => ({
    description: MOCK_DESCRIPTION,
    rating: 4.8,
    tags: ['Luxury', 'Relaxation', 'Culture'],
    duration: '5-7 Days',
    costLevel: '$$$',
    bestSeason: 'Spring / Autumn',
    weather: '25°C',
    currency: 'USD ($)',     // Default fallback
    voltage: '110V (Type A)', // Default fallback
    landmarks: DEFAULT_LANDMARKS,
    ...dest,
    ...overrides
});

// --- ROMANTIC GETAWAYS ---
export const ROMANTIC_DESTINATIONS: Destination[] = [
    enrich({
        id: 'r1',
        name: 'Santorini',
        location: 'Greece',
        imageUri: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=800&auto=format&fit=crop',
    }, {
        description: "Santorini is the world's most popular island for a romantic getaway. Famous for its white-washed buildings, blue domes, and stunning sunsets over the caldera.",
        tags: ['Honeymoon', 'Views', 'Luxury'],
        costLevel: '$$$$',
        bestSeason: 'May - Oct',
        currency: 'Euro (€)',
        voltage: '230V (Type C/F)',
        landmarks: [
            { name: 'Oia Sunset', image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600&auto=format&fit=crop' },
            { name: 'Red Beach', image: 'https://images.unsplash.com/photo-1758829421372-e32405b6a707?q=80&w=600&auto=format&fit=crop' },
            { name: 'Fira Town', image: 'https://images.unsplash.com/photo-1736618626048-251e4e27dad0?q=80&w=600&auto=format&fit=crop' }
        ]
    }),
    enrich({
        id: 'r2',
        name: 'Paris',
        location: 'France',
        imageUri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
    }, {
        description: "The City of Light draws millions of visitors every year with its unforgettable ambiance. The Seine, the museums, the cafes—it's pure magic for couples.",
        tags: ['City', 'Culture', 'Shopping'],
        costLevel: '$$$',
        bestSeason: 'April - June',
        currency: 'Euro (€)',
        voltage: '230V (Type E)',
    }),
    enrich({
        id: 'r3',
        name: 'Amalfi Coast',
        location: 'Italy',
        imageUri: 'https://images.unsplash.com/photo-1596736743518-eef8c49026b7?q=80&w=800&auto=format&fit=crop',
    }, {
        costLevel: '$$$$',
        currency: 'Euro (€)',
        voltage: '230V (Type L)',
    }),
    enrich({
        id: 'r4',
        name: 'Kyoto',
        location: 'Japan',
        imageUri: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
    }, {
        bestSeason: 'Mar - May',
        currency: 'Yen (¥)',
        voltage: '100V (Type A)',
    })
];

// --- AFFORDABLE LUXURY ---
export const AFFORDABLE_LUXURY_DESTINATIONS: Destination[] = [
    enrich({
        id: 'l1',
        name: 'Bali',
        location: 'Indonesia',
        imageUri: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop',
    }, {
        costLevel: '$$',
        currency: 'Rupiah (Rp)',
        voltage: '230V (Type C/F)',
    }),
    enrich({
        id: 'l2',
        name: 'Bangkok',
        location: 'Thailand',
        imageUri: 'https://images.unsplash.com/photo-1598970605070-a38a6ccd3a2d?q=80&w=800&auto=format&fit=crop',
    }, {
        costLevel: '$$',
        currency: 'Baht (฿)',
        voltage: '230V (Type A/C)',
    }),
    enrich({
        id: 'l3',
        name: 'Budapest',
        location: 'Hungary',
        imageUri: 'https://images.unsplash.com/photo-1565426873118-a17ed65d74b9?q=80&w=800&auto=format&fit=crop',
    }, {
        costLevel: '$',
        currency: 'Forint (HUF)',
        voltage: '230V (Type C/F)',
    }),
    enrich({
        id: 'l4',
        name: 'Lisbon',
        location: 'Portugal',
        imageUri: 'https://images.unsplash.com/photo-1562250883-a18ef907fcab?q=80&w=800&auto=format&fit=crop',
    }, {
        costLevel: '$$',
        currency: 'Euro (€)',
        voltage: '230V (Type F)',
    })
];

// --- RELAXATION ---
export const RELAXATION_DESTINATIONS: Destination[] = [
    enrich({
        id: 'b1',
        name: 'Maldives',
        location: 'South Asia',
        imageUri: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop',
    }, {
        costLevel: '$$$$$',
        currency: 'Rufiyaa (MVR)',
        voltage: '230V (Type G)',
    }),
    enrich({
        id: 'b2',
        name: 'Tulum',
        location: 'Mexico',
        imageUri: 'https://images.unsplash.com/photo-1506477331477-33d5d8b3dc85?q=80&w=800&auto=format&fit=crop',
    }, {
        costLevel: '$$$',
        currency: 'Peso (MXN)',
        voltage: '127V (Type A)',
    }),
    enrich({
        id: 'b3',
        name: 'Seychelles',
        location: 'East Africa',
        imageUri: 'https://images.unsplash.com/photo-1626085263072-d503e3dea011?q=80&w=800&auto=format&fit=crop',
    }, {
        costLevel: '$$$$',
        currency: 'Rupee (SCR)',
        voltage: '240V (Type G)',
    })
];

export const INSPIRATION_DESTINATIONS: Destination[] = [
    enrich({
        id: '1',
        imageUri: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop',
        name: 'Swiss Alps',
        location: 'Switzerland',
        currency: 'Franc (CHF)',
        voltage: '230V (Type J)'
    }),
    enrich({
        id: '2',
        imageUri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop',
        name: 'Paris',
        location: 'France',
        currency: 'Euro (€)',
        voltage: '230V (Type E)'
    }),
    enrich({
        id: '3',
        imageUri: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop',
        name: 'Bali',
        location: 'Indonesia',
        currency: 'Rupiah (Rp)',
        voltage: '230V (Type C)'
    }),
    enrich({
        id: '4',
        imageUri: 'https://images.unsplash.com/photo-1580752300969-1ceaaa1f3039?q=80&w=1000&auto=format&fit=crop',
        name: 'New York City',
        location: 'USA',
        currency: 'USD ($)',
        voltage: '120V (Type A/B)'
    }),
    enrich({
        id: '5',
        imageUri: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=1000&auto=format&fit=crop',
        name: 'Cinque Terre',
        location: 'Italy',
        currency: 'Euro (€)',
        voltage: '230V (Type L)'
    }),
];

export const getAllDestinations = (): Destination[] => [
    ...ROMANTIC_DESTINATIONS,
    ...AFFORDABLE_LUXURY_DESTINATIONS,
    ...RELAXATION_DESTINATIONS,
    ...INSPIRATION_DESTINATIONS,
];

export const getDestinationById = (id: string): Destination | undefined => {
    return getAllDestinations().find(d => d.id === id);
};