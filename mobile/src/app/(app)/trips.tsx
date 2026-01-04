import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Map } from 'lucide-react-native';

export default function TripsScreen() {
    return (
        <View className="flex-1 bg-black">
            <SafeAreaView className="flex-1 px-6 pt-4">
                <Text className="text-white text-3xl font-black mb-6 tracking-wide">MY TRIPS</Text>

                {/* Empty State Container */}
                <View className="flex-1 items-center justify-center opacity-50 pb-20">
                    <View className="w-24 h-24 bg-white/5 rounded-full items-center justify-center mb-6 border border-white/10">
                        <Map color="white" size={40} />
                    </View>
                    <Text className="text-white text-xl font-bold mb-2">No trips planned</Text>
                    <Text className="text-white/50 text-center px-8 leading-6">
                        Ready for your next adventure? Go to Explore and start planning with AI.
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}