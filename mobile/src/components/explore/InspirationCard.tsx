import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Plus, ArrowRight, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics'; // Import Haptics

import { INSPIRATION_DESTINATIONS } from '../../constants/destinations';

export function InspirationCard() {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);

    // Preload images
    useEffect(() => {
        const urls = INSPIRATION_DESTINATIONS.map(d => d.imageUri);
        Image.prefetch(urls);
    }, []);

    // Auto-rotate slider
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % INSPIRATION_DESTINATIONS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const currentDest = INSPIRATION_DESTINATIONS[currentIndex];

    return (
        <TouchableOpacity
            activeOpacity={0.95}
            onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} // FIX: Added Haptics
            onPress={() => router.push('/create')} // FIX: Updated route to root stack
            className="mx-6 h-[450px] rounded-[32px] overflow-hidden relative border border-white/10 bg-white/5"
        >
            <Image
                source={currentDest.imageUri}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
                contentFit="cover"
                transition={1000}
                cachePolicy="memory-disk"
            />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.4)', '#000000']}
                locations={[0, 0.5, 1]}
                style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%' }}
            />

            <Animated.View
                key={currentIndex}
                entering={FadeIn.duration(600)}
                exiting={FadeOut.duration(400)}
                className="absolute top-6 left-6 flex-row items-center bg-black/40 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md"
            >
                <MapPin size={12} color="white" fill="white" />
                <Text className="text-white text-xs font-bold ml-1.5 mr-1">
                    {currentDest.name}, <Text className="text-white/70 font-normal">{currentDest.location}</Text>
                </Text>
            </Animated.View>

            <View className="absolute bottom-0 w-full p-8 pb-10 items-center">
                <View className="w-16 h-16 rounded-full bg-white/10 items-center justify-center border border-white/20 mb-6 backdrop-blur-md">
                    <Plus color="white" size={32} />
                </View>

                <Text className="text-white text-3xl font-bold text-center mb-2 tracking-tight">
                    No trips planned yet
                </Text>
                <Text className="text-white/70 text-center mb-8 text-base px-4 leading-6 font-medium">
                    The world is waiting for you. Start planning your next adventure to {currentDest.name} or anywhere else.
                </Text>

                <View className="w-full h-14 bg-kamino-violet rounded-2xl flex-row items-center justify-center shadow-lg shadow-kamino-violet/25 border border-white/10">
                    <Text className="text-white font-bold text-base mr-2 uppercase tracking-wide">Create New Trip</Text>
                    <ArrowRight color="white" size={18} strokeWidth={2.5} />
                </View>
            </View>
        </TouchableOpacity>
    );
}