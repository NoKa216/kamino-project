import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Heart, Info, ArrowRight, ChevronLeft } from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';

import { SwipeableCard } from '../../../../components/discovery/SwipeableCard';
import PlaceDetailsModal from '../../../../components/PlaceDetailsModal';
import { TripsService } from '../../../../services/trips';
import { PlaceCandidate } from '../../../../types/place.types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

export default function SwipeScreen() {
    const router = useRouter();
    const { id: tripId, candidates: candidatesParam, swipedIds: swipedIdsParam } = useLocalSearchParams();

    // Parse initial candidates and swiped IDs with useMemo (prevents re-parsing on every render)
    const initialCandidates = useMemo(() => {
        if (!candidatesParam) return [];

        try {
            const allCandidates = JSON.parse(candidatesParam as string);

            // Parse already-swiped IDs for filtering
            let swipedIds: string[] = [];
            if (swipedIdsParam) {
                try {
                    swipedIds = JSON.parse(swipedIdsParam as string);
                } catch (e) {
                    console.warn('[Swipe] Failed to parse swipedIds:', e);
                }
            }

            // Filter out already-swiped candidates
            const validCandidates = Array.isArray(allCandidates)
                ? allCandidates.filter((c: PlaceCandidate) => !swipedIds.includes(c.id))
                : [];

            console.log(`[Swipe] Total: ${allCandidates.length}, Swiped: ${swipedIds.length}, Remaining: ${validCandidates.length}`);
            return validCandidates;
        } catch (e) {
            console.error('[Swipe] Failed to parse candidates:', e);
            return [];
        }
    }, [candidatesParam, swipedIdsParam]);

    // Candidates state - initialized from memoized parsed value
    const [candidates, setCandidates] = useState<PlaceCandidate[]>([]);
    const [selectedPlace, setSelectedPlace] = useState<PlaceCandidate | null>(null);

    // Set initial candidates once when component mounts
    useEffect(() => {
        setCandidates(initialCandidates);
    }, [initialCandidates]);

    const [likedPlaces, setLikedPlaces] = useState<PlaceCandidate[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const activeCandidate = candidates[currentIndex];

    // Animation Values
    const translateX = useSharedValue(0);
    const rotate = useSharedValue(0);

    const handleSwipeComplete = (direction: 'left' | 'right') => {
        // Update UI state immediately
        if (direction === 'right') {
            setLikedPlaces(prev => [...prev, activeCandidate]);
        }

        // Record swipe to backend (fire-and-forget, non-blocking)
        if (tripId && activeCandidate) {
            const swipeDirection = direction === 'right' ? 'like' : 'dislike';
            TripsService.recordSwipe(
                tripId as string,
                activeCandidate,
                swipeDirection
            );
        }

        setCurrentIndex(prev => prev + 1);
        translateX.value = 0;
        rotate.value = 0;
    };

    const pan = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            rotate.value = interpolate(
                event.translationX,
                [-SCREEN_WIDTH / 2, SCREEN_WIDTH / 2],
                [-15, 15],
                Extrapolation.CLAMP
            );
        })
        .onEnd((event) => {
            if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                const direction = event.translationX > 0 ? 'right' : 'left';
                translateX.value = withSpring(direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100, {}, () => {
                    runOnJS(handleSwipeComplete)(direction);
                });
            } else {
                translateX.value = withSpring(0);
                rotate.value = withSpring(0);
            }
        });

    const cardStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { rotate: `${rotate.value}deg` }
        ]
    }));

    // Overlay opacities
    const likeOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [0, SCREEN_WIDTH / 4], [0, 1])
    }));

    const nopeOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [-SCREEN_WIDTH / 4, 0], [1, 0])
    }));

    const buildItinerary = () => {
        // TODO: Send likedPlaces to backend to finalize itinerary
        console.log("Building itinerary with likes:", likedPlaces.length);
        alert("Building itinerary with " + likedPlaces.length + " places! (Feature pending)");
        router.replace('/(app)/trips');
    };

    if (!candidates.length) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white">Loading candidates...</Text>
            </View>
        );
    }

    if (currentIndex >= candidates.length) {
        return (
            <View className="flex-1 bg-black items-center justify-center px-6">
                <Heart size={64} color="#A78BFA" fill="#A78BFA" />
                <Text className="text-white text-3xl font-bold mt-8 text-center">All Caught Up!</Text>
                <Text className="text-neutral-400 text-center mt-4 mb-8">
                    You've liked {likedPlaces.length} places. Ready to build your itinerary?
                </Text>

                <Pressable
                    onPress={buildItinerary}
                    className="w-full bg-kamino-violet py-4 rounded-full items-center flex-row justify-center active:opacity-80"
                >
                    <Text className="text-white font-bold text-lg mr-2">Build Itinerary</Text>
                    <ArrowRight size={20} color="white" />
                </Pressable>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-black">
            <SafeAreaView className="flex-1">

                {/* Header */}
                <View className="px-6 py-4 flex-row justify-between items-center">
                    {/* Left: Back Button + Title */}
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.canGoBack() ? router.back() : router.replace('/(app)/trips')}
                            className="bg-white/10 w-10 h-10 rounded-full items-center justify-center mr-3"
                        >
                            <ChevronLeft color="white" size={22} />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-white text-2xl font-bold">Discover</Text>
                            <Text className="text-neutral-400">Swipe to curate your trip</Text>
                        </View>
                    </View>
                    {/* Right: Progress Counter */}
                    <View className="bg-white/10 px-4 py-2 rounded-full">
                        <Text className="text-white font-bold">{currentIndex + 1} / {candidates.length}</Text>
                    </View>
                </View>

                {/* Cards Container - FULL SCREEN IMMERSIVE */}
                <View className="flex-1 items-center justify-center pt-2 pb-6">
                    {/* Background Card (Next One) */}
                    {currentIndex + 1 < candidates.length && (
                        <View className="absolute w-full h-full px-1 rounded-[32px] opacity-100 scale-[0.98] z-0">
                            <SwipeableCard candidate={candidates[currentIndex + 1]} />
                            <View className="absolute inset-0 mx-1 bg-black/50 rounded-[32px]" />
                        </View>
                    )}

                    <GestureDetector gesture={pan}>
                        <Animated.View style={[cardStyle]} className="w-full h-full px-0 z-10 shadow-2xl shadow-black">
                            <SwipeableCard
                                candidate={activeCandidate}
                                onDetailsPress={() => setSelectedPlace(activeCandidate)}
                            />

                            {/* Overlay Labels - Centered & Larger */}
                            <Animated.View style={[likeOpacity]} className="absolute top-1/3 left-10 -rotate-12 border-4 border-green-400 rounded-2xl px-6 py-4 bg-green-500/20 z-50">
                                <Text className="text-green-400 font-black text-5xl uppercase tracking-widest shadow-lg shadow-black">LIKE</Text>
                            </Animated.View>
                            <Animated.View style={[nopeOpacity]} className="absolute top-1/3 right-10 rotate-12 border-4 border-red-500 rounded-2xl px-6 py-4 bg-red-500/20 z-50">
                                <Text className="text-red-500 font-black text-5xl uppercase tracking-widest shadow-lg shadow-black">NOPE</Text>
                            </Animated.View>

                            {/* Subtle Hint Text at bottom */}
                            <View className="absolute bottom-4 w-full items-center opacity-50 z-10" pointerEvents="none">
                                <Text className="text-white text-[10px] uppercase tracking-widest font-medium">Swipe Left or Right</Text>
                            </View>

                        </Animated.View>
                    </GestureDetector>
                </View>

            </SafeAreaView>

            {/* Place Details Modal */}
            <PlaceDetailsModal
                isVisible={!!selectedPlace}
                onClose={() => setSelectedPlace(null)}
                place={selectedPlace}
            />
        </View>
    );
}
