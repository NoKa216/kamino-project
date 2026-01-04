import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User as UserIcon, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

/**
 * ProfileScreen
 * Displays user information and account settings.
 * Accessible via the header avatar in the Explore screen.
 */
export default function ProfileScreen() {
    const { user, logout } = useAuth();
    const router = useRouter();

    /**
     * Handles navigation back to the main app flow.
     * Ensures the user isn't stuck if they landed here directly via deep link or reload.
     */
    const handleBack = () => {
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(app)'); // Fallback to Home/Explore
        }
    };

    return (
        <View className="flex-1 bg-black">
            <SafeAreaView className="flex-1 px-6 pt-4">

                {/* Header with Back Button */}
                <View className="flex-row items-center mb-8">
                    <TouchableOpacity
                        onPress={handleBack} // <--- UPDATED: Uses safe handler
                        className="bg-white/10 p-2 rounded-full mr-4 active:bg-white/20"
                    >
                        <ChevronLeft color="white" size={24} />
                    </TouchableOpacity>
                    <Text className="text-white text-3xl font-black tracking-wide">PROFILE</Text>
                </View>

                {/* User Info Card */}
                <View className="flex-row items-center bg-white/5 p-5 rounded-3xl border border-white/10 mb-8">
                    <View className="w-16 h-16 rounded-full bg-white/10 items-center justify-center border border-white/20 overflow-hidden">
                        {user?.avatar ? (
                            <Image source={{ uri: user.avatar }} className="w-full h-full" />
                        ) : (
                            <UserIcon color="white" size={30} />
                        )}
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className="text-white text-xl font-bold">{user?.fullName || 'Traveler'}</Text>
                        <Text className="text-white/40 text-sm mt-1">{user?.email}</Text>
                    </View>
                </View>

                {/* Settings / Actions List (Placeholder) */}
                <View className="flex-1">
                    {/* Add settings items here later */}
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    onPress={logout}
                    className="flex-row items-center justify-center bg-red-500/10 border border-red-500/20 p-5 rounded-2xl active:bg-red-500/20 mb-8"
                >
                    <LogOut color="#ef4444" size={20} />
                    <Text className="text-red-500 font-bold ml-3 uppercase tracking-wider">Sign Out</Text>
                </TouchableOpacity>

            </SafeAreaView>
        </View>
    );
}