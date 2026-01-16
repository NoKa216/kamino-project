/**
 * FlightSection - Flight booking UI for LogisticsStep
 * 
 * Uses FlightTimeInput for DRY time selection.
 */

import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { Plane } from 'lucide-react-native';

import { FlightTimeInput } from './FlightTimeInput';

interface FlightDetails {
    arrivalTime?: string;
    departureTime?: string;
}

interface FlightSectionProps {
    hasBookedFlights: boolean;
    flightDetails?: FlightDetails;
    onToggleFlights: (value: boolean) => void;
    onUpdateFlightDetails: (updates: Partial<FlightDetails>) => void;
}

export function FlightSection({
    hasBookedFlights,
    flightDetails,
    onToggleFlights,
    onUpdateFlightDetails
}: FlightSectionProps) {
    const [flightPhase, setFlightPhase] = useState<'arrival' | 'departure'>('arrival');

    return (
        <View className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 z-40">
            {/* Header with Toggle */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <View className="bg-kamino-violet/20 p-2 rounded-full mr-3">
                        <Plane color="#8B5CF6" size={20} />
                    </View>
                    <Text className="text-white text-lg font-semibold">Booked Flights?</Text>
                </View>
                <Switch
                    trackColor={{ false: '#3f3f46', true: '#8B5CF6' }}
                    thumbColor="#FFFFFF"
                    onValueChange={onToggleFlights}
                    value={hasBookedFlights}
                />
            </View>

            {hasBookedFlights ? (
                <Animated.View layout={LinearTransition.springify()}>
                    {/* Progress Dots */}
                    <View className="flex-row justify-center gap-2 mb-4">
                        <View className={`h-1.5 w-1.5 rounded-full ${flightPhase === 'arrival' ? 'bg-kamino-violet' : 'bg-white/20'}`} />
                        <View className={`h-1.5 w-1.5 rounded-full ${flightPhase === 'departure' ? 'bg-kamino-violet' : 'bg-white/20'}`} />
                    </View>

                    {/* PHASE 1: Arrival */}
                    {flightPhase === 'arrival' && (
                        <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                            <Text className="text-white/80 text-sm font-semibold mb-4 text-center">Arrival Details</Text>

                            <FlightTimeInput
                                label="Arrival Time"
                                value={flightDetails?.arrivalTime}
                                onChange={(time) => onUpdateFlightDetails({ arrivalTime: time })}
                            />

                            <TouchableOpacity
                                onPress={() => setFlightPhase('departure')}
                                className="bg-kamino-violet h-12 rounded-xl flex-row items-center justify-center mb-2"
                            >
                                <Text className="text-white font-bold text-base mr-2">Next: Return Details</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                    {/* PHASE 2: Departure */}
                    {flightPhase === 'departure' && (
                        <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                            <Text className="text-white/80 text-sm font-semibold mb-4 text-center">Return Details</Text>

                            <FlightTimeInput
                                label="Departure Time"
                                value={flightDetails?.departureTime}
                                onChange={(time) => onUpdateFlightDetails({ departureTime: time })}
                            />

                            <TouchableOpacity
                                onPress={() => setFlightPhase('arrival')}
                                className="border border-white/20 h-12 rounded-xl flex-row items-center justify-center mb-2"
                            >
                                <Text className="text-white/80 font-bold text-base">Back to Arrival</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}
                </Animated.View>
            ) : (
                <Animated.View layout={LinearTransition.springify()}>
                    <Text className="text-white/40 text-sm italic ml-11">
                        We'll plan full days for you.
                    </Text>
                </Animated.View>
            )}
        </View>
    );
}
