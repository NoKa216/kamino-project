import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart } from 'lucide-react-native';

export default function SavedScreen() {
    return (
        <View className="flex-1 bg-black">
            <SafeAreaView className="flex-1 px-6 pt-4">
                <Text className="text-white text-3xl font-black mb-6 tracking-wide">WISHLIST</Text>

                {/* Empty State Container */}
                <View className="flex-1 items-center justify-center opacity-50 pb-20">
                    <View className="w-24 h-24 bg-white/5 rounded-full items-center justify-center mb-6 border border-white/10">
                        <Heart color="white" size={40} />
                    </View>
                    <Text className="text-white text-xl font-bold mb-2">No saved places yet</Text>
                    <Text className="text-white/50 text-center px-10 leading-6">
                        Start exploring and save your dream destinations to build your bucket list.
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}