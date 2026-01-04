import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Destination } from '../../constants/destinations';
import { useRouter } from 'expo-router'; // Updated: Needed for navigation

interface CategorySectionProps {
    title: string;
    subtitle?: string;
    data: Destination[];
}

export function CategorySection({ title, subtitle, data }: CategorySectionProps) {
    return (
        <View className="mb-10">
            {/* Section Header */}
            <View className="px-6 mb-5">
                <Text className="text-white text-2xl font-medium tracking-tight">{title}</Text>
                {subtitle && (
                    <Text className="text-white/50 text-sm font-normal mt-1">{subtitle}</Text>
                )}
            </View>

            {/* Horizontal Scroll */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24 }}
            >
                {data.map((item) => (
                    <CategoryCard key={item.id} item={item} />
                ))}
            </ScrollView>
        </View>
    );
}

const CategoryCard = ({ item }: { item: Destination }) => {
    const router = useRouter(); // Initialize router hook

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            // Navigate to the destination details page on press
            onPress={() => router.push({
                pathname: "/destination/[id]",
                params: { id: item.id }
            })}
            // Card Styles: w-64 h-80 for premium vertical look
            className="mr-5 w-64 h-80 rounded-[32px] overflow-hidden relative border border-white/10 bg-white/5 shadow-2xl shadow-black"
        >
            {/* Full size immersive image */}
            <Image
                source={item.imageUri}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
                transition={500}
                cachePolicy="memory-disk"
            />

            {/* Gradient Overlay for text readability */}
            <LinearGradient
                colors={['transparent', 'transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
                locations={[0, 0.4, 0.7, 1]}
                style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100%' }}
            />

            {/* Clean Text Content */}
            <View className="absolute bottom-6 left-6 right-6">
                <Text
                    className="text-white/70 text-xs font-bold uppercase tracking-[2px] mb-1"
                    numberOfLines={1}
                >
                    {item.location}
                </Text>
                <Text
                    className="text-white text-3xl font-medium tracking-tight shadow-black"
                    numberOfLines={1}
                >
                    {item.name}
                </Text>
            </View>
        </TouchableOpacity>
    );
};