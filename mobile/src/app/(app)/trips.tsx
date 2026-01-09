import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Map, Calendar, ChevronRight } from 'lucide-react-native';
import { useFocusEffect } from 'expo-router';
import { TripsService, GeneratedTrip } from '../../services/trips';

export default function TripsScreen() {
    const [trips, setTrips] = useState<GeneratedTrip[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadTrips = async () => {
        try {
            const data = await TripsService.getUserTrips();
            setTrips(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadTrips();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadTrips();
    };

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
        // Handle trip data structure gracefully (it might vary depending on Gemini output or data structure)
        // Assuming item.trip.itinerary has title/description
        const title = item.trip?.itinerary?.title || item.trip?.destination || "Trip";
        const subtitle = item.trip?.itinerary?.description || `${item.trip?.destination}`;

        return (
            <TouchableOpacity className="bg-neutral-900 rounded-2xl mb-4 p-4 border border-white/10 active:bg-neutral-800">
                <View className="flex-row justify-between items-start">
                    <View className="flex-1 mr-4">
                        <Text className="text-white text-lg font-bold mb-1">{title}</Text>
                        <Text className="text-neutral-400 text-sm mb-3" numberOfLines={2}>{subtitle}</Text>

                        <View className="flex-row items-center space-x-4">
                            {item.trip?.startDate && (
                                <View className="flex-row items-center bg-white/5 px-2 py-1 rounded-md">
                                    <Calendar size={12} color="#A78BFA" style={{ marginRight: 6 }} />
                                    <Text className="text-neutral-400 text-xs">
                                        {new Date(item.trip.startDate).toLocaleDateString()}
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

                <FlatList
                    data={trips}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.tripId}
                    contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
                    ListEmptyComponent={!loading ? renderEmptyState : null}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#A78BFA" />
                    }
                />
            </SafeAreaView>
        </View>
    );
}