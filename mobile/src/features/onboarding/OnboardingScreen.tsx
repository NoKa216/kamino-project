import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, ViewToken, Dimensions, FlatList } from 'react-native';
import LottieView from 'lottie-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { slides } from './onboardingData';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    // טיפול במעבר דפים בצורה נקייה
    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setActiveIndex(viewableItems[0].index);
        }
    }, []);

    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

    const handleNext = () => {
        if (activeIndex < slides.length - 1) {
            flatListRef.current?.scrollToIndex({
                index: activeIndex + 1,
                animated: true
            });
        } else {
            router.replace('/(auth)/login');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-8 pt-4 items-end">
                <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                    <Text className="text-slate-400 font-bold text-xs tracking-widest uppercase">Skip</Text>
                </TouchableOpacity>
            </View>

            {/* FlatList סטנדרטי - ללא 'Animated' כדי להעלים את האזהרות */}
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
                    <View style={{ width }} className="px-10 flex-1 justify-center">
                        <View style={{ height: height * 0.35 }} className="items-center justify-center">
                            <LottieView
                                source={item.source}
                                autoPlay
                                loop
                                style={{ width: '100%', height: '100%' }}
                            />
                        </View>

                        <View className="mt-10">
                            <Text className="text-4xl font-black text-kamino-dark leading-[44px] tracking-tighter">
                                {item.title}
                            </Text>
                            <Text className="text-slate-500 text-lg mt-4 leading-7 font-medium">
                                {item.subtitle}
                            </Text>
                        </View>
                    </View>
                )}
            />

            {/* Footer */}
            <View className="px-10 pb-12">
                <View className="flex-row mb-10 space-x-2 h-1.5 items-center">
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            className={`h-full rounded-full transition-all duration-300 ${index === activeIndex ? 'w-12 bg-kamino-violet' : 'w-2 bg-slate-200'
                                }`}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    className="bg-kamino-violet w-full h-16 rounded-2xl items-center justify-center shadow-xl shadow-indigo-100"
                    onPress={handleNext}
                >
                    <Text className="text-white font-bold text-lg">
                        {activeIndex === slides.length - 1 ? "Start Planning" : "Next Step"}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}