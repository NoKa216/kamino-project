/**
 * My Trips Screen - View Layer (MVVM Pattern)
 * 
 * Pure UI component that renders based on controller state.
 * All business logic is extracted to useTripsScreenController.
 */

import React from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Map, Calendar, ChevronRight, AlertCircle } from 'lucide-react-native';
import { useTripsScreenController } from '../../features/trips/hooks/useTripsScreenController';
import { GeneratedTrip } from '../../services/trips';

export default function TripsScreen() {
    // Controller provides all state and actions
    const {
        trips,
        isLoading,
        isError,
        isRefreshing,
        handleTripPress,
        handleRefresh
    } = useTripsScreenController();

    // Loading skeleton
    const renderLoadingState = () => (
        <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#A78BFA" />
            <Text className="text-neutral-400 mt-4">Loading trips...</Text>
        </View>
    );

    // Error state
    const renderErrorState = () => (
        <View className="flex-1 items-center justify-center py-20">
            <AlertCircle color="#EF4444" size={48} />
            <Text className="text-white text-lg font-bold mt-4">Something went wrong</Text>
            <Text className="text-neutral-400 text-center px-8 mt-2">
                Could not load your trips. Pull to refresh.
            </Text>
        </View>
    );

    // Empty state
    const renderEmptyState = () => (
        <View className="flex-1 items-center justify-center opacity-50 py-20">
            <View className="w-24 h-24 bg-white/5 rounded-full items-center justify-center mb-6 border border-white/10">
                <Map color="white" size={40} />
            </View>
            <Text className="text-white text-xl font-bold mb-2">No trips planned</Text>
            <Text className="text-white/50 text-center px-8 leading-6">
                Ready for your next adventure? Go to Explore and start planning with AI.
            </Text>
        </View>
    );

    const renderItem = ({ item }: { item: GeneratedTrip }) => {
        const destination = item.destination || 'Unknown Destination';
        const startDate = item.startDate;
        const status = item.status || 'planning';
        const candidateCount = item.candidates?.length || 0;

        return (
            <TouchableOpacity
                onPress={() => handleTripPress(item)}
                className="bg-neutral-900 rounded-2xl mb-4 p-4 border border-white/10 active:bg-neutral-800"
            >
                <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-4">
                        <Text className="text-white text-lg font-bold mb-1">{destination}</Text>
                        <Text className="text-neutral-400 text-sm mb-3" numberOfLines={2}>
                            {status === 'planning'
                                ? `${candidateCount} places to explore • Tap to continue`
                                : 'View your itinerary'}
                        </Text>

                        <View className="flex-row items-center space-x-4">
                            {startDate && (
                                <View className="flex-row items-center bg-white/5 px-2 py-1 rounded-md">
                                    <Calendar size={12} color="#A78BFA" style={{ marginRight: 6 }} />
                                    <Text className="text-neutral-400 text-xs">
                                        {new Date(startDate).toLocaleDateString()}
                                    </Text>
                                </View>
                            )}

                            {status === 'planning' && (
                                <View className="bg-kamino-violet/20 px-2 py-1 rounded-md">
                                    <Text className="text-kamino-violet text-xs font-bold uppercase">
                                        In Progress
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <ChevronRight color="#525252" size={20} style={{ marginTop: 4 }} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-black">
            <SafeAreaView className="flex-1 px-6 pt-4">
                <Text className="text-white text-3xl font-black mb-6 tracking-wide">MY TRIPS</Text>

                {isLoading ? renderLoadingState() : (
                    <FlatList
                        data={trips}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => item.id || item.tripId || `trip-${index}`}
                        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
                        ListEmptyComponent={isError ? renderErrorState : renderEmptyState}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                tintColor="#A78BFA"
                            />
                        }
                    />
                )}
            </SafeAreaView>
        </View>
    );
}