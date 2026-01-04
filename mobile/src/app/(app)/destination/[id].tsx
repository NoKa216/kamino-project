import React, { useCallback } from 'react'; // Added useCallback
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router'; // Added useFocusEffect
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import {
    ChevronLeft, Clock, Calendar,
    Thermometer, Wallet, MapPin,
    Zap, Banknote, Sparkles, ArrowRight
} from 'lucide-react-native';
import Animated, {
    useAnimatedRef, useScrollViewOffset, useAnimatedStyle,
    interpolate
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { getDestinationById } from '../../../constants/destinations';

const { width } = Dimensions.get('window');
const IMG_HEIGHT = 450;

export default function DestinationDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const destination = getDestinationById(id as string);

    // --- PARALLAX SCROLL SETUP ---
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffset = useScrollViewOffset(scrollRef);

    // FIX: Reset scroll position to top whenever the screen comes into focus or ID changes
    useFocusEffect(
        useCallback(() => {
            if (scrollRef.current) {
                scrollRef.current.scrollTo({ y: 0, animated: false });
            }
        }, [id])
    );

    // Animated style for the hero image parallax effect
    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: interpolate(
                        scrollOffset.value,
                        [-IMG_HEIGHT, 0, IMG_HEIGHT],
                        [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.75]
                    ),
                },
                {
                    scale: interpolate(
                        scrollOffset.value,
                        [-IMG_HEIGHT, 0, IMG_HEIGHT],
                        [2, 1, 1]
                    ),
                },
            ],
        };
    });

    if (!destination) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white">Destination not found</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-[#050505]">
            <StatusBar barStyle="light-content" />

            {/* --- BACK BUTTON --- */}
            <View
                style={{ top: insets.top + 10, left: 20, zIndex: 10 }}
                className="absolute"
            >
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-black/40 rounded-full items-center justify-center border border-white/10 backdrop-blur-md"
                >
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
            </View>

            <Animated.ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                // Important: Add significant bottom padding to ensure content clears the floating CTA
                contentContainerStyle={{ paddingBottom: 160 }}
            >
                {/* --- HERO IMAGE SECTION --- */}
                <View style={{ height: IMG_HEIGHT, width: width, overflow: 'hidden' }}>
                    <Animated.View style={[{ width: '100%', height: '100%' }, imageAnimatedStyle]}>
                        <Image
                            source={destination.imageUri}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                        />
                        <LinearGradient
                            colors={['transparent', '#050505']}
                            locations={[0.5, 1]}
                            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%' }}
                        />
                    </Animated.View>
                </View>

                {/* --- MAIN CONTENT CONTAINER --- */}
                <View className="px-6 -mt-20">
                    {/* Header Info */}
                    <View className="mb-8">
                        <View className="flex-row items-center mb-2">
                            <MapPin size={14} color="rgba(255,255,255,0.8)" />
                            <Text className="text-white/80 text-sm ml-1 uppercase tracking-widest font-bold">
                                {destination.location}
                            </Text>
                        </View>
                        <Text className="text-white text-5xl font-black tracking-tighter mb-4 shadow-2xl">
                            {destination.name}
                        </Text>

                        {/* Tags List */}
                        <View className="flex-row flex-wrap gap-2 mb-6">
                            {destination.tags.map((tag, index) => (
                                <View key={index} className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                                    <Text className="text-white text-xs font-semibold">{tag}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Statistics Grid */}
                        <View className="bg-white/5 p-5 rounded-3xl border border-white/10 flex-row flex-wrap justify-between gap-y-6">
                            <StatItem icon={Clock} label="Duration" value={destination.duration} width="30%" />
                            <View className="w-[1px] bg-white/10 h-10 self-center" />
                            <StatItem icon={Wallet} label="Cost" value={destination.costLevel} width="30%" />
                            <View className="w-[1px] bg-white/10 h-10 self-center" />
                            <StatItem icon={Thermometer} label="Weather" value={destination.weather} width="30%" />

                            <View className="w-full h-[1px] bg-white/10 my-1" />

                            <StatItem icon={Banknote} label="Currency" value={destination.currency} width="45%" />
                            <View className="w-[1px] bg-white/10 h-10 self-center" />
                            <StatItem icon={Zap} label="Voltage" value={destination.voltage} width="45%" />
                        </View>
                    </View>

                    {/* Description Section */}
                    <View className="mb-10">
                        <Text className="text-white text-xl font-bold mb-3">About</Text>
                        <Text className="text-white/70 text-base leading-7 font-medium">
                            {destination.description}
                        </Text>
                    </View>

                    {/* Landmarks Carousel */}
                    <View className="mb-6">
                        <Text className="text-white text-xl font-bold mb-4">Must See</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                            {destination.landmarks.map((landmark, index) => (
                                <View key={index} className="mr-4 w-40">
                                    <View className="h-40 w-40 rounded-2xl overflow-hidden mb-2 border border-white/10">
                                        <Image
                                            source={landmark.image}
                                            style={{ width: '100%', height: '100%' }}
                                            contentFit="cover"
                                        />
                                    </View>
                                    <Text className="text-white text-sm font-semibold ml-1">{landmark.name}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Best Time Info */}
                    <View className="mb-6 bg-white/5 p-6 rounded-3xl border border-white/10 flex-row items-center justify-between">
                        <View className="flex-1">
                            <Text className="text-white text-lg font-bold mb-1">Best time to visit</Text>
                            <Text className="text-white/50 text-sm">Optimal weather & fewer crowds</Text>
                        </View>
                        <View className="bg-kamino-violet/20 px-4 py-2 rounded-xl border border-kamino-violet/30">
                            <Text className="text-kamino-violet font-bold">{destination.bestSeason}</Text>
                        </View>
                    </View>
                </View>
            </Animated.ScrollView>

            {/* --- FLOATING CTA BUTTON (Glassmorphism + Glow) --- */}
            <View className="absolute bottom-8 left-6 right-6 z-50">
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPressIn={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    onPress={() => router.push({
                        pathname: '/create',
                        params: { initialDestination: destination.name }
                    })}
                    className="h-[72px] rounded-[28px] bg-[#1A1A1A] flex-row items-center justify-between px-5 border border-white/10 shadow-2xl shadow-black"
                >
                    <View className="flex-row items-center">
                        {/* Icon Container: Brand color with glow effect */}
                        <View className="w-12 h-12 bg-kamino-violet/20 rounded-full items-center justify-center border border-kamino-violet/30 mr-4">
                            <Sparkles color="#A78BFA" size={22} fill="#A78BFA" />
                        </View>

                        <View>
                            {/* Subtitle: Lighter purple for contrast */}
                            <Text className="text-[#C4B5FD] text-[11px] uppercase font-bold tracking-widest mb-0.5">
                                Start Planning
                            </Text>
                            {/* Main Title: White for readability */}
                            <Text className="text-white font-bold text-xl tracking-tight">
                                Create Itinerary
                            </Text>
                        </View>
                    </View>

                    {/* Action Arrow */}
                    <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center border border-white/5">
                        <ArrowRight color="white" size={20} />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// Helper component for statistics grid items
const StatItem = ({ icon: Icon, label, value, width }: any) => (
    <View style={{ width: width }} className="items-center justify-center">
        <Icon size={18} color="rgba(255,255,255,0.6)" />
        <Text className="text-white/40 text-[10px] uppercase font-bold mt-2 mb-0.5">{label}</Text>
        <Text className="text-white font-bold text-sm text-center">{value}</Text>
    </View>
);