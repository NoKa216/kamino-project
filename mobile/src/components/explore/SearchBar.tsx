import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Search, Plane } from 'lucide-react-native';
import { useRouter } from 'expo-router';

/**
 * SearchBar Component
 * A presentational component that triggers the 'Create Trip' flow.
 */
export function SearchBar() {
    const router = useRouter();

    return (
        <View className="px-6 mb-10">
            <TouchableOpacity
                onPress={() => router.push('/(app)/create')}
                activeOpacity={0.8}
                className="w-full h-16 bg-white/5 rounded-[20px] border border-white/10 flex-row items-center px-5 overflow-hidden active:bg-white/10"
            >
                <Search color="rgba(255,255,255,0.4)" size={20} />
                <Text className="text-white/40 text-base ml-4 font-medium flex-1">
                    Where is your next dream?
                </Text>
                <View className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center">
                    <Plane color="white" size={18} style={{ transform: [{ rotate: '-45deg' }] }} />
                </View>
            </TouchableOpacity>
        </View>
    );
}