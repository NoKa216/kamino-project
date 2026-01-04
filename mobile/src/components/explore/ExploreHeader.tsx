import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native'; // Added Image import
import { Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ExploreHeaderProps {
    user: any;
}

export function ExploreHeader({ user }: ExploreHeaderProps) {
    const router = useRouter();
    const [greeting, setGreeting] = useState('Good Morning');

    // נניח שיש לנו התראות (אפשר לחבר את זה לסטייט אמיתי בהמשך)
    const hasNotifications = true;

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) {
            setGreeting('Good Morning');
        } else if (hour >= 12 && hour < 18) {
            setGreeting('Good Afternoon');
        } else if (hour >= 18 && hour < 22) {
            setGreeting('Good Evening');
        } else {
            setGreeting('Good Night');
        }
    }, []);

    const getInitials = (name: string) => {
        return name ? name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'ME';
    };

    return (
        <View className="flex-row justify-between items-center px-6 pt-4 mb-8">
            <View>
                <Text className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                    {greeting},
                </Text>
                <Text className="text-white text-3xl font-medium tracking-tight">
                    {user?.fullName?.split(' ')[0] || 'Traveler'}
                </Text>
            </View>

            <View className="flex-row items-center gap-x-4">
                {/* Notification Bell */}
                <TouchableOpacity className="w-10 h-10 rounded-full bg-white/5 items-center justify-center border border-white/10 active:bg-white/10 relative">
                    <Bell color={hasNotifications ? "white" : "rgba(255,255,255,0.8)"} size={20} strokeWidth={1.5} />

                    {/* Professional Notification Indicator */}
                    {hasNotifications && (
                        <View className="absolute top-2.5 right-2.5">
                            {/* הבועה עצמה */}
                            <View className="w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#1c1c1e]" />
                            {/* אפקט זוהר עדין מאחור */}
                            <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full blur-[4px] opacity-50 -z-10" />
                        </View>
                    )}
                </TouchableOpacity>

                {/* User Avatar - UPDATED LOGIC */}
                <TouchableOpacity
                    onPress={() => router.push('/(app)/profile')}
                    className={`w-10 h-10 rounded-full items-center justify-center border border-white/10 shadow-lg ${user?.avatar ? 'bg-black' : 'bg-kamino-violet shadow-kamino-violet/20'}`}
                >
                    {user?.avatar ? (
                        <Image
                            source={{ uri: user.avatar }}
                            className="w-full h-full rounded-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <Text className="text-white font-bold text-xs">
                            {getInitials(user?.fullName || '')}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}