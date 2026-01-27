/**
 * Swipe Screen - View Layer (MVVM Pattern)
 * 
 * Pure UI component that renders based on controller state.
 * All business logic is extracted to useSwipeScreenController.
 */

import React from 'react';
import { View, Text, Pressable, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, ArrowRight, ChevronLeft } from 'lucide-react-native';

import { CardStack } from '../../../../components/discovery/CardStack';
import PlaceDetailsModal from '../../../../components/PlaceDetailsModal';
import { useSwipeScreenController } from '../../../../features/discovery/hooks/useSwipeScreenController';
import { Loader } from '../../../../components/ui/Loader';

export default function SwipeScreen() {
    // Controller provides all state and actions
    const {
        unswipedCandidates,
        likedCount,
        isLoading,
        isComplete,
        isBuilding,
        selectedPlace,
        handleSwipe,
        handleDetailsPress,
        handleCloseDetails,
        handleComplete,
        handleBuildItinerary,
        goBack,
    } = useSwipeScreenController();

    // Loading state
    if (isLoading) {
        return <Loader />;
    }

    // No candidates
    if (!unswipedCandidates.length && !isComplete) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white">No places to discover</Text>
            </View>
        );
    }

    // Complete state
    if (isComplete) {
        return (
            <View className="flex-1 bg-black items-center justify-center px-6">
                <Heart size={64} color="#A78BFA" fill="#A78BFA" />
                <Text className="text-white text-3xl font-bold mt-8 text-center">All Caught Up!</Text>
                <Text className="text-neutral-400 text-center mt-4 mb-8">
                    You've liked {likedCount} places. Ready to build your itinerary?
                </Text>

                <Pressable
                    onPress={handleBuildItinerary}
                    disabled={isBuilding}
                    className={`w-full bg-kamino-violet py-4 rounded-full items-center flex-row justify-center ${isBuilding ? 'opacity-50' : 'active:opacity-80'}`}
                >
                    {isBuilding ? (
                        <>
                            <ActivityIndicator color="white" size="small" />
                            <Text className="text-white font-bold text-lg ml-2">Building with AI...</Text>
                        </>
                    ) : (
                        <>
                            <Text className="text-white font-bold text-lg mr-2">Build Itinerary</Text>
                            <ArrowRight size={20} color="white" />
                        </>
                    )}
                </Pressable>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <SafeAreaView className="flex-1">

                {/* Header */}
                <View className="px-6 py-4 flex-row justify-between items-center">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={goBack}
                            className="bg-white/10 w-10 h-10 rounded-full items-center justify-center mr-3"
                        >
                            <ChevronLeft color="white" size={22} />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-white text-2xl font-bold">Discover</Text>
                            <Text className="text-neutral-400">Swipe to curate your trip</Text>
                        </View>
                    </View>
                    <View className="bg-white/10 px-4 py-2 rounded-full">
                        <Text className="text-white font-bold">{unswipedCandidates.length} left</Text>
                    </View>
                </View>

                {/* Card Stack */}
                <View className="flex-1 px-0">
                    <CardStack
                        candidates={unswipedCandidates}
                        onSwipe={handleSwipe}
                        onDetailsPress={handleDetailsPress}
                        onComplete={handleComplete}
                    />
                </View>

            </SafeAreaView>

            {/* Place Details Modal */}
            <PlaceDetailsModal
                isVisible={!!selectedPlace}
                onClose={handleCloseDetails}
                place={selectedPlace}
            />
        </View>
    );
}
