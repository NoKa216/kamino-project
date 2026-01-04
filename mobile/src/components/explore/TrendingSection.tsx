import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * TrendingSection Component
 * Horizontal scroll view displaying popular destinations.
 */
export function TrendingSection() {
    return (
        <View className="px-6">
            <Text className="text-white text-xl font-medium mb-5">Trending Destinations</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6 pb-8">
                <TrendingCard
                    image="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1000&auto=format&fit=crop"
                    title="Tokyo"
                    subtitle="Japan"
                />
                <TrendingCard
                    image="https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1000&auto=format&fit=crop"
                    title="Bali"
                    subtitle="Indonesia"
                />
                <TrendingCard
                    image="https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=1000&auto=format&fit=crop"
                    title="NYC"
                    subtitle="USA"
                />
            </ScrollView>
        </View>
    );
}

const TrendingCard = ({ image, title, subtitle }: { image: string, title: string, subtitle: string }) => (
    <TouchableOpacity activeOpacity={0.8} className="mr-4 w-40 h-56 rounded-[24px] overflow-hidden relative border border-white/10 bg-white/5">
        <Image
            source={{ uri: image }}
            className="w-full h-full"
            resizeMode="cover"
        />
        <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.9)']}
            locations={[0, 0.5, 1]}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%' }}
        />
        <View className="absolute bottom-4 left-4">
            <Text className="text-white font-bold text-lg">{title}</Text>
            <Text className="text-white/70 text-xs font-medium">{subtitle}</Text>
        </View>
    </TouchableOpacity>
);