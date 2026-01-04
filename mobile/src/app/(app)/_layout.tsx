import React from 'react';
import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { Globe, Heart, Briefcase } from 'lucide-react-native';

export default function AppLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: true,
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                    marginBottom: 8,
                    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
                },
                tabBarStyle: {
                    position: 'absolute',
                    bottom: 25,
                    left: 20,
                    right: 20,
                    elevation: 0,
                    backgroundColor: 'rgba(15, 15, 20, 0.95)',
                    borderRadius: 35,
                    height: 75,
                    paddingTop: 12,
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(255,255,255,0.1)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 10 },
                    shadowOpacity: 0.5,
                    shadowRadius: 20,
                },
                tabBarActiveTintColor: '#8B5CF6',
                tabBarInactiveTintColor: '#64748b',
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Explore',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon icon={Globe} color={color} focused={focused} shouldFill={false} />
                    ),
                }}
            />

            <Tabs.Screen
                name="trips"
                options={{
                    title: 'Trips',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon icon={Briefcase} color={color} focused={focused} shouldFill={false} />
                    ),
                }}
            />

            <Tabs.Screen
                name="saved"
                options={{
                    title: 'Saved',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon icon={Heart} color={color} focused={focused} shouldFill={true} />
                    ),
                }}
            />

            {/* Hidden Routes */}
            <Tabs.Screen name="profile" options={{ href: null, tabBarStyle: { display: 'none' } }} />

            <Tabs.Screen
                name="destination/[id]"
                options={{
                    href: null,
                    tabBarStyle: { display: 'none' }
                }}
            />

            {/* create screen removed from here as it moved to root stack */}
        </Tabs>
    );
}

const TabIcon = ({ icon: Icon, color, focused, shouldFill = false }: any) => {
    return (
        <View className="items-center justify-center">
            {focused && (
                <View className="absolute w-12 h-12 bg-kamino-violet/20 rounded-full blur-md" />
            )}
            <Icon
                color={color}
                size={26}
                strokeWidth={focused ? 2.5 : 1.5}
                fill={focused && shouldFill ? color : "transparent"}
            />
        </View>
    );
};