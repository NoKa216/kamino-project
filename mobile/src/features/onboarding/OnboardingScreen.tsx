import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ViewToken, Dimensions, FlatList, StatusBar } from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { slides } from './onboardingData';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const { completeOnboarding } = useAuth();
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setActiveIndex(viewableItems[0].index);
        }
    }, []);

    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

    const handleNext = async () => {
        if (activeIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: activeIndex + 1,
                animated: true
            });
        } else {
            await completeOnboarding();
        }
    };

    return (
        <LinearGradient
            // Deep background: Black -> Very Dark Violet -> Black
            colors={['#000000', '#110520', '#000000']}
            locations={[0, 0.5, 1]}
            style={{ flex: 1 }}
        >
            <SafeAreaView className="flex-1">
                <StatusBar barStyle="light-content" />

                {/* Skip Button */}
                <View className="px-8 pt-4 items-end z-20">
                    <TouchableOpacity
                        onPress={completeOnboarding}
                        className="bg-white/10 px-4 py-2 rounded-full active:bg-white/20"
                    >
                        <Text className="text-white/60 font-bold text-[10px] tracking-widest uppercase">Skip</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={slides}
                    keyExtractor={(item) => item.id}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged}
                    viewabilityConfig={viewConfigRef.current}
                    renderItem={({ item }) => (
                        <View style={{ width }} className="px-6 flex-1 justify-center pb-8">

                            {/* --- Image Section (The Card) --- */}
                            <View className="items-center justify-center mb-10 relative">

                                {/* 1. The Glow: Ambient violet glow behind the card for depth */}
                                <View className="absolute w-64 h-64 bg-kamino-violet/30 rounded-full blur-[60px]" />

                                {/* 2. The Container: Clean white card, framing the content naturally */}
                                <View
                                    style={{ width: width * 0.85, height: width * 0.75 }}
                                    className="bg-white rounded-[32px] overflow-hidden shadow-2xl items-center justify-center p-4"
                                >
                                    {/* FIX: Use 'contain' to ensure the entire illustration fits within the frame without clipping */}
                                    <LottieView
                                        source={item.source}
                                        autoPlay
                                        loop
                                        style={{ width: '100%', height: '100%' }}
                                        resizeMode="contain"
                                    />
                                </View>
                            </View>

                            {/* --- Text Section --- */}
                            <View className="px-2 gap-y-4">
                                <Text className="text-4xl font-black text-white leading-[44px] tracking-tight text-center">
                                    {item.title}
                                </Text>
                                <Text className="text-white/60 text-base leading-6 font-medium text-center px-2">
                                    {item.subtitle}
                                </Text>
                            </View>
                        </View>
                    )}
                />

                {/* --- Bottom Controls --- */}
                <View className="px-8 pb-10 w-full">
                    {/* Pagination Indicators */}
                    <View className="flex-row mb-8 space-x-2 h-1.5 items-center justify-center">
                        {slides.map((_, index) => (
                            <View
                                key={index}
                                className={`h-full rounded-full transition-all duration-300 ${index === activeIndex
                                        ? 'w-8 bg-kamino-violet' // Active
                                        : 'w-2 bg-white/10'      // Inactive
                                    }`}
                            />
                        ))}
                    </View>

                    {/* Main Action Button */}
                    <TouchableOpacity
                        className="bg-kamino-violet w-full h-16 rounded-2xl items-center justify-center shadow-lg shadow-kamino-violet/25 active:bg-kamino-violet/90"
                        onPress={handleNext}
                        activeOpacity={0.9}
                    >
                        <Text className="text-white font-black text-lg uppercase tracking-[2px]">
                            {activeIndex === slides.length - 1 ? "Start Planning" : "Next Step"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}