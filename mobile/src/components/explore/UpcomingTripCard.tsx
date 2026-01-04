import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import { MapPin, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export function UpcomingTripCard({ trip }: { trip: any }) {
    const router = useRouter();

    return (
        <TouchableOpacity
            activeOpacity={0.95}
            className="mx-6 h-[450px] rounded-[32px] overflow-hidden relative border border-white/10 bg-white/5"
            onPress={() => router.push('/(app)/trips')}
        >
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2973&auto=format&fit=crop' }}
                className="w-full h-full justify-end"
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['transparent', 'transparent', 'rgba(0,0,0,0.5)', '#000000']}
                    locations={[0, 0.4, 0.7, 1]}
                    style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '100%' }}
                />

                <View className="p-6 pb-8">
                    <View className="self-start bg-white/20 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md mb-4">
                        <Text className="text-white text-[10px] font-bold uppercase tracking-widest">5 Days Left</Text>
                    </View>

                    <Text className="text-white text-6xl font-medium tracking-tighter mb-2 shadow-black shadow-lg">Paris</Text>

                    <View className="flex-row items-center mb-6 opacity-90">
                        <MapPin color="white" size={16} fill="white" />
                        <Text className="text-white ml-2 text-base font-medium">France</Text>
                        <Text className="text-white/40 mx-2">•</Text>
                        <Text className="text-white text-base font-medium">Dec 24-31</Text>
                    </View>

                    <View className="w-full h-14 bg-white rounded-2xl flex-row items-center justify-center">
                        <Text className="text-black font-bold text-base mr-2 uppercase tracking-wide">Open Itinerary</Text>
                        <ArrowRight color="black" size={18} strokeWidth={2.5} />
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
}