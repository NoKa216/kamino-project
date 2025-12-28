import React, { useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, Dimensions, Animated, TouchableOpacity, ViewToken } from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ודאי שהנתיבים האלו נכונים במבנה התיקיות שלך!
import { slides } from '../../features/onboarding/onboardingData';
import AuthModal from '../../auth/AuthModal';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const [showAuth, setShowAuth] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    // תיקון סוגים קטן ל-TypeScript
    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setActiveIndex(viewableItems[0].index);
        }
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Skip Button - top-4 for better spacing */}
            <TouchableOpacity
                className="absolute top-4 right-8 z-10"
                onPress={() => setShowAuth(true)}
            >
                <Text className="text-gray-500 font-bold text-lg">Skip</Text>
            </TouchableOpacity>

            <Animated.FlatList
                data={slides}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                    { useNativeDriver: false }
                )}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewConfigRef.current}
                renderItem={({ item }) => (
                    <View style={{ width }} className="items-center justify-center -mt-20">
                        <View className="w-[300px] h-[300px] mb-8">
                            <LottieView
                                source={item.source}
                                autoPlay
                                loop
                                style={{ width: '100%', height: '100%' }}
                            />
                        </View>
                        <Text className="text-3xl font-bold text-slate-800 text-center mt-8 px-4">
                            {item.title}
                        </Text>
                        <Text className="text-gray-500 text-center text-lg mt-4 px-8 leading-6">
                            {item.subtitle}
                        </Text>

                        {item.id === '3' && (
                            <TouchableOpacity
                                className="bg-kamino-violet rounded-full py-4 px-10 mt-10 shadow-lg shadow-indigo-200"
                                onPress={() => setShowAuth(true)}
                            >
                                <Text className="text-white font-bold text-lg">Start Planning</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />

            {/* Pagination Dots */}
            <View className="flex-row justify-center mb-10 space-x-2 h-4 items-center">
                {slides.map((_, index) => {
                    const isActive = index === activeIndex;
                    return (
                        <View
                            key={index}
                            className={`rounded-full transition-all duration-300 ${isActive ? 'w-8 h-2 bg-kamino-violet' : 'w-2 h-2 bg-gray-300'}`}
                        />
                    );
                })}
            </View>

            {/* The Modal */}
            <AuthModal visible={showAuth} onClose={() => setShowAuth(false)} />
        </SafeAreaView>
    );
}