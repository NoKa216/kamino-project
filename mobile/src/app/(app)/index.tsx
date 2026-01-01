import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
    const { user, logout } = useAuth();

    // =============================================================================
    // RENDER GUARD
    // =============================================================================
    // Prevents UI glitches during logout. If user state is null (during the 
    // split-second before navigation redirects to Login), render a blank view.
    if (!user) {
        return <View className="flex-1 bg-black" />;
    }

    return (
        <View className="flex-1 bg-black">
            <SafeAreaView className="flex-1 items-center justify-center px-6">

                {/* Profile Picture Section */}
                <View className="w-32 h-32 rounded-full bg-white/10 border-2 border-kamino-violet items-center justify-center mb-6 overflow-hidden shadow-lg shadow-kamino-violet/50">
                    {user.avatar ? (
                        <Image
                            source={{ uri: user.avatar }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <User color="rgba(255,255,255,0.8)" size={48} />
                    )}
                </View>

                {/* User Information */}
                <Text className="text-white/60 text-sm uppercase tracking-widest font-medium mb-2">
                    Welcome Back
                </Text>
                <Text className="text-white text-3xl font-black text-center mb-12">
                    {user.fullName || 'Guest Traveler'}
                </Text>

                {/* Logout Action */}
                <TouchableOpacity
                    onPress={logout}
                    activeOpacity={0.7}
                    className="flex-row items-center bg-red-500/10 border border-red-500/50 px-8 py-4 rounded-2xl"
                >
                    <LogOut color="#ef4444" size={20} />
                    <Text className="text-red-500 font-bold ml-3 text-lg uppercase tracking-wide">
                        Sign Out
                    </Text>
                </TouchableOpacity>

            </SafeAreaView>
        </View>
    );
}