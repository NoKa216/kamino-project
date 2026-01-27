/**
 * CardStack - Reanimated Swipe Stack Component
 * 
 * High-performance card stack with physics-based gestures.
 * Uses React Native Reanimated for 60fps native animations.
 * 
 * Features:
 * - Only renders top 2 cards for performance
 * - Native gesture handling with PanGesture
 * - Like/Nope overlays with interpolated opacity
 * - Spring animations for natural feel
 * 
 * @module components/discovery/CardStack
 */

import React, { memo, useCallback, useState } from 'react';
import { View, Dimensions, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { SwipeableCard } from './SwipeableCard';
import { PlaceCandidate } from '../../types/place.types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const ROTATION_ANGLE = 15;

interface CardStackProps {
    candidates: PlaceCandidate[];
    onSwipe: (direction: 'like' | 'dislike', place: PlaceCandidate) => void;
    onDetailsPress?: (place: PlaceCandidate) => void;
    onComplete?: () => void;
}

/**
 * Swipeable card stack with Reanimated physics.
 */
export const CardStack = memo<CardStackProps>(({
    candidates,
    onSwipe,
    onDetailsPress,
    onComplete
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Animation values
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);

    const activeCard = candidates[currentIndex];
    const nextCard = candidates[currentIndex + 1];
    const hasCards = currentIndex < candidates.length;

    const handleSwipeComplete = useCallback((direction: 'left' | 'right') => {
        if (!activeCard) return;

        const swipeDirection = direction === 'right' ? 'like' : 'dislike';
        onSwipe(swipeDirection, activeCard);

        // Move to next card
        setCurrentIndex(prev => {
            const next = prev + 1;
            if (next >= candidates.length) {
                onComplete?.();
            }
            return next;
        });

        // Reset animation values
        translateX.value = 0;
        translateY.value = 0;
    }, [activeCard, candidates.length, onSwipe, onComplete, translateX, translateY]);

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;
        })
        .onEnd((event) => {
            // Check if swipe passed threshold
            if (event.translationX > SWIPE_THRESHOLD) {
                // Swipe right - like
                translateX.value = withSpring(SCREEN_WIDTH * 1.5, { damping: 50 }, () => {
                    runOnJS(handleSwipeComplete)('right');
                });
            } else if (event.translationX < -SWIPE_THRESHOLD) {
                // Swipe left - dislike
                translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { damping: 50 }, () => {
                    runOnJS(handleSwipeComplete)('left');
                });
            } else {
                // Return to center with spring
                translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
                translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
            }
        });

    // Animated styles for top card
    const cardAnimatedStyle = useAnimatedStyle(() => {
        const rotation = interpolate(
            translateX.value,
            [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            [-ROTATION_ANGLE, 0, ROTATION_ANGLE],
            Extrapolation.CLAMP
        );

        return {
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { rotate: `${rotation}deg` },
            ],
        };
    });

    // Like overlay opacity
    const likeOverlayStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [0, SWIPE_THRESHOLD],
            [0, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    // Nope overlay opacity
    const nopeOverlayStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [-SWIPE_THRESHOLD, 0],
            [1, 0],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    // Next card scale (zooms in as top card moves)
    const nextCardStyle = useAnimatedStyle(() => {
        const scale = interpolate(
            Math.abs(translateX.value),
            [0, SWIPE_THRESHOLD],
            [0.95, 1],
            Extrapolation.CLAMP
        );
        return {
            transform: [{ scale }],
        };
    });

    if (!hasCards) {
        return null; // Stack complete, parent should handle this
    }

    return (
        <View style={styles.container}>
            {/* Next card (behind) */}
            {nextCard && (
                <Animated.View style={[styles.cardContainer, styles.nextCard, nextCardStyle]}>
                    <SwipeableCard
                        candidate={nextCard}
                        onDetailsPress={() => onDetailsPress?.(nextCard)}
                    />
                </Animated.View>
            )}

            {/* Top card (swiping) */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
                    <SwipeableCard
                        candidate={activeCard}
                        onDetailsPress={() => onDetailsPress?.(activeCard)}
                    />

                    {/* LIKE overlay - Centered & Massive */}
                    <Animated.View style={[styles.overlayContainer, likeOverlayStyle]} pointerEvents="none">
                        <View style={styles.likeStamp}>
                            <Text style={styles.likeText}>LIKE</Text>
                        </View>
                    </Animated.View>

                    {/* NOPE overlay - Centered & Massive */}
                    <Animated.View style={[styles.overlayContainer, nopeOverlayStyle]} pointerEvents="none">
                        <View style={styles.nopeStamp}>
                            <Text style={styles.nopeText}>NOPE</Text>
                        </View>
                    </Animated.View>
                </Animated.View>
            </GestureDetector>
        </View>
    );
});

CardStack.displayName = 'CardStack';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    nextCard: {
        zIndex: 0,
    },
    // Overlay container - fills card and centers content
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
    },
    // LIKE stamp - rotated, massive, high contrast
    likeStamp: {
        transform: [{ rotate: '-30deg' }],
        borderWidth: 8,
        borderColor: '#10B981',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    likeText: {
        fontSize: 72,
        fontWeight: '900',
        color: '#10B981',
        letterSpacing: 6,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    // NOPE stamp - rotated opposite, massive, high contrast
    nopeStamp: {
        transform: [{ rotate: '30deg' }],
        borderWidth: 8,
        borderColor: '#EF4444',
        borderRadius: 16,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    nopeText: {
        fontSize: 72,
        fontWeight: '900',
        color: '#EF4444',
        letterSpacing: 6,
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
});

