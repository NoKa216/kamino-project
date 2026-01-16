/**
 * LogisticsStep - Container Component
 * 
 * Manages state for flight and accommodation logistics.
 * Delegates UI rendering to FlightSection and AccommodationSection.
 */

import React from 'react';
import { Text } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

import { FlightSection } from './logistics/FlightSection';
import { AccommodationSection } from './logistics/AccommodationSection';

// --- Interfaces ---

export interface LogisticsData {
    hasBookedFlights: boolean;
    flightDetails?: {
        arrivalTime?: string;
        departureTime?: string;
    };
    hasBookedAccommodation: boolean;
    accommodationDetails?: {
        hotelName?: string;
        location?: string;
    };
}

interface LogisticsStepProps {
    logistics: LogisticsData;
    setLogistics: (data: LogisticsData) => void;
}

// --- Component ---

export const LogisticsStep = ({ logistics, setLogistics }: LogisticsStepProps) => {
    // Update helpers
    const updateLogistics = (updates: Partial<LogisticsData>) => {
        setLogistics({ ...logistics, ...updates });
    };

    const updateFlightDetails = (updates: Partial<NonNullable<LogisticsData['flightDetails']>>) => {
        updateLogistics({
            flightDetails: {
                ...logistics.flightDetails,
                ...updates
            }
        });
    };

    const updateAccommodationDetails = (updates: Partial<NonNullable<LogisticsData['accommodationDetails']>>) => {
        updateLogistics({
            accommodationDetails: {
                ...logistics.accommodationDetails,
                ...updates
            }
        });
    };

    return (
        <Animated.ScrollView
            entering={FadeInRight}
            exiting={FadeOutLeft}
            className="flex-1 px-6 pt-8"
            contentContainerStyle={{ paddingBottom: 160 }}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <Text className="text-white text-3xl font-bold mb-2">Logistics & Timing</Text>
            <Text className="text-white/50 text-base mb-8">Help us tailor the schedule to your arrival.</Text>

            {/* Flight Section */}
            <FlightSection
                hasBookedFlights={logistics.hasBookedFlights}
                flightDetails={logistics.flightDetails}
                onToggleFlights={(val) => updateLogistics({ hasBookedFlights: val })}
                onUpdateFlightDetails={updateFlightDetails}
            />

            {/* Accommodation Section */}
            <AccommodationSection
                hasBookedAccommodation={logistics.hasBookedAccommodation}
                accommodationDetails={logistics.accommodationDetails}
                onToggleAccommodation={(val) => updateLogistics({ hasBookedAccommodation: val })}
                onUpdateAccommodationDetails={updateAccommodationDetails}
            />
        </Animated.ScrollView>
    );
};