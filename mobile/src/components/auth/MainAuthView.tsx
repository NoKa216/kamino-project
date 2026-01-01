import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    onEmailPress: () => void;
    // Callbacks for social authentication buttons
    onGooglePress: () => void;
    onApplePress: () => void;
    onFacebookPress: () => void;
}

/**
 * MainAuthView: The initial view displayed in the Auth modal.
 * Provides options for social login and navigation to email login.
 */
export const MainAuthView = ({
    onEmailPress,
    onGooglePress,
    onApplePress,
    onFacebookPress
}: Props) => (
    <>
        {/* Logo Section */}
        <View className="items-center mb-10">
            <Image
                source={require('../../../assets/logo.png')}
                style={{ width: 130, height: 130 }}
                resizeMode="contain"
            />
            <View className="h-[1px] w-8 bg-white/20 mt-2" />
        </View>

        {/* Social Login Buttons Section */}
        <View className="w-full gap-y-4 mb-6">
            {/* Google Button */}
            <TouchableOpacity
                onPress={onGooglePress}
                activeOpacity={0.8}
                className="flex-row items-center justify-center bg-white/10 border border-white/20 h-16 rounded-2xl active:bg-white/20"
            >
                <MaterialCommunityIcons name="google" size={20} color="white" style={{ position: 'absolute', left: 24 }} />
                <Text className="text-white font-bold text-base">Continue with Google</Text>
            </TouchableOpacity>

            {/* Apple Button */}
            <TouchableOpacity
                onPress={onApplePress}
                activeOpacity={0.8}
                className="flex-row items-center justify-center bg-white/10 border border-white/20 h-16 rounded-2xl active:bg-white/20"
            >
                <FontAwesome name="apple" size={24} color="white" style={{ position: 'absolute', left: 24 }} />
                <Text className="text-white font-bold text-base">Continue with Apple</Text>
            </TouchableOpacity>

            {/* Facebook Button */}
            <TouchableOpacity
                onPress={onFacebookPress}
                activeOpacity={0.8}
                className="flex-row items-center justify-center bg-white/10 border border-white/20 h-16 rounded-2xl active:bg-white/20"
            >
                <FontAwesome name="facebook-official" size={20} color="white" style={{ position: 'absolute', left: 24 }} />
                <Text className="text-white font-bold text-base">Continue with Facebook</Text>
            </TouchableOpacity>
        </View>

        {/* Email Login Navigation */}
        <TouchableOpacity className="items-center py-4" onPress={onEmailPress}>
            <View className="flex-row items-center border-b border-white/30 pb-1">
                <Text className="text-white/50 text-[11px] font-medium uppercase tracking-[3px]">
                    Explore with Email
                </Text>
            </View>
        </TouchableOpacity>
    </>
);