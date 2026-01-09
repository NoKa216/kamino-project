import Constants from 'expo-constants';

const BACKEND_URL = Constants.expoConfig?.hostUri
    ? `http://${Constants.expoConfig.hostUri.split(':').shift()}:3000/api`
    : 'http://localhost:3000/api';

export interface TripGenerationData {
    destination: string;
    startDate: string;
    endDate: string;
    travelers?: string;
    budget?: string;
    interests?: string[];
    mustHaveItems?: string[]; // NEW
}

export interface GeneratedTrip {
    success?: boolean;
    tripId: string;
    trip?: any;
    candidates?: any[];
}

export const TripsService = {
    generateTrip: async (data: TripGenerationData, token?: string): Promise<GeneratedTrip> => {
        try {
            // Temporary auth header if token is missing for dev
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                // Mock token if none provided (Matches backend mock middleware expectation if any)
                headers['Authorization'] = `Bearer dev-token`;
            }

            console.log('Generating trip with data:', data);
            const response = await fetch(`${BACKEND_URL}/trips/generate`, {
                method: 'POST',
                headers,
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to generate trip: ${response.status} ${errorText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Trip generation error:', error);
            throw error;
        }
    },

    getUserTrips: async (token?: string): Promise<GeneratedTrip[]> => {
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                headers['Authorization'] = `Bearer dev-token`;
            }

            const response = await fetch(`${BACKEND_URL}/trips`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                throw new Error('Failed to fetch trips');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching trips:', error);
            return [];
        }
    }
};
