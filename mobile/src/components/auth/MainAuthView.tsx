import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    onEmailPress: () => void;
    onGooglePress: () => void;
    onApplePress: () => void;
    onFacebookPress: () => void;
}

export const MainAuthView = ({
    onEmailPress,
    onGooglePress,
    onApplePress
}: Props) => (
    <>
        <View className="items-center mb-10">
            {/* Original Logo (No tint) */}
            <Image
                source={require('../../../assets/logo.png')}
                style={{ width: 140, height: 140 }}
                resizeMode="contain"
            />
        </View>

        <View className="w-full gap-y-4 mb-6">
            {/* Dark Glass Buttons */}
            <TouchableOpacity
                onPress={onGooglePress}
                activeOpacity={0.8}
                className="flex-row items-center justify-center bg-white/10 border border-white/20 h-16 rounded-2xl active:bg-white/20"
            >
                <MaterialCommunityIcons name="google" size={20} color="white" style={{ position: 'absolute', left: 24 }} />
                <Text className="text-white font-bold text-base">Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onApplePress}
                activeOpacity={0.8}
                className="flex-row items-center justify-center bg-white/10 border border-white/20 h-16 rounded-2xl active:bg-white/20"
            >
                <FontAwesome name="apple" size={24} color="white" style={{ position: 'absolute', left: 24 }} />
                <Text className="text-white font-bold text-base">Continue with Apple</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity className="items-center py-4" onPress={onEmailPress}>
            <View className="flex-row items-center border-b border-white/30 pb-1">
                <Text className="text-white/50 text-[11px] font-medium uppercase tracking-[3px]">
                    Explore with Email
                </Text>
            </View>
        </TouchableOpacity>
    </>
);