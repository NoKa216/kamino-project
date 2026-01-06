import {
    Utensils, Mountain, ShoppingBag, Camera, Palette,
    Umbrella, Moon, Compass, Landmark, HeartHandshake,
    Construction, Music, Tent, Scroll, Wine,
    Coffee, Pizza, Beer, Trees, Waves,
    Bike, Dumbbell, Book, Star, Plane
} from 'lucide-react-native';

export const INTERESTS_DATA = [
    // --- Food & Drink ---
    { id: 'foodie', label: 'Foodie', icon: Utensils },
    { id: 'wine', label: 'Wine & Dining', icon: Wine },
    { id: 'coffee', label: 'Coffee Culture', icon: Coffee },
    { id: 'streetfood', label: 'Street Food', icon: Pizza },
    { id: 'beer', label: 'Breweries', icon: Beer },

    // --- Nature & Outdoors ---
    { id: 'nature', label: 'Nature', icon: Mountain },
    { id: 'beaches', label: 'Beaches', icon: Umbrella },
    { id: 'hiking', label: 'Hiking', icon: Tent },
    { id: 'water_sports', label: 'Water Sports', icon: Waves },
    { id: 'parks', label: 'National Parks', icon: Trees },

    // --- Urban & Lifestyle ---
    { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'nightlife', label: 'Nightlife', icon: Moon },
    { id: 'luxury', label: 'Luxury', icon: Star },
    { id: 'architecture', label: 'Architecture', icon: Construction },
    { id: 'travel_hacking', label: 'Travel Hacking', icon: Plane },

    // --- Culture & Arts ---
    { id: 'history', label: 'History', icon: Scroll },
    { id: 'museums', label: 'Art & Museums', icon: Palette },
    { id: 'music', label: 'Live Music', icon: Music },
    { id: 'culture', label: 'Local Culture', icon: Landmark },
    { id: 'photography', label: 'Photography', icon: Camera },

    // --- Activity & Wellness ---
    { id: 'adventure', label: 'Adventure', icon: Compass },
    { id: 'wellness', label: 'Wellness & Spa', icon: HeartHandshake },
    { id: 'sports', label: 'Active Sports', icon: Dumbbell },
    { id: 'cycling', label: 'Cycling', icon: Bike },
    { id: 'reading', label: 'Quiet & Reading', icon: Book },
];