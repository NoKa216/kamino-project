import React, { useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, Dimensions, Animated, TouchableOpacity, ViewToken } from 'react-native';
import LottieView from 'lottie-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router'; // <--- חשוב לייבא את זה

// ודאי שהנתיב הזה נכון אצלך
import { slides } from '../../features/onboarding/onboardingData';

const { width } = Dimensions.get('window');

export default function OnboardingScreen() {
    const router = useRouter(); // <--- הוק לניווט
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;

    const insets = useSafeAreaInsets();
    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: ViewToken[] }) => {
        if (viewableItems.length > 0 && viewableItems[0].index !== null) {
            setActiveIndex(viewableItems[0].index);
        }
    }, []);

    const handleFinishOnboarding = () => {
        router.replace('/(auth)/login');
    };

    return (
        <View className="flex-1 bg-white">

            {/* כפתור Skip */}
            <View
                className="absolute right-4 z-50"
                style={{ top: insets.top + 10 }}
            >
                <TouchableOpacity
                    onPress={handleFinishOnboarding} // <--- מפעיל ניווט
                    className="bg-gray-100 px-4 py-2 rounded-full"
                >
                    <Text className="text-black font-semibold text-sm">Skip</Text>
                </TouchableOpacity>
            </View>

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
                    <View style={{ width }} className="items-center justify-center flex-1 px-6">
                        {/* אנימציה */}
                        <View className="w-[300px] h-[300px] mb-8">
                            <LottieView
                                source={item.source}
                                autoPlay
                                loop
                                style={{ width: '100%', height: '100%' }}
                            />
                        </View>

                        {/* טקסטים */}
                        <View className="mt-4">
                            <Text className="text-3xl font-bold text-slate-800 text-center mb-2">
                                {item.title}
                            </Text>
                            <Text className="text-gray-500 text-center text-lg leading-7 px-4">
                                {item.subtitle}
                            </Text>
                        </View>

                        {/* כפתור התחלה - רק בשקופית האחרונה */}
                        {item.id === '3' && (
                            <TouchableOpacity
                                className="bg-kamino-violet rounded-full py-4 px-12 mt-12 shadow-lg"
                                onPress={handleFinishOnboarding} // <--- מפעיל ניווט
                            >
                                <Text className="text-white font-bold text-lg">Start Planning</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            />

            {/* נקודות אינדיקציה */}
            <View
                className="flex-row justify-center space-x-2 h-4 items-center absolute bottom-12 w-full"
            >
                {slides.map((_, index) => {
                    const isActive = index === activeIndex;
                    const width = isActive ? 32 : 8;
                    return (
                        <View
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${isActive ? 'bg-kamino-violet' : 'bg-gray-300'}`}
                            style={{ width }}
                        />
                    );
                })}
            </View>
        </View>
    );
}