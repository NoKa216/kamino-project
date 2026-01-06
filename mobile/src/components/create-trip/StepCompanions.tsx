import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { User, Heart, Users, PartyPopper } from 'lucide-react-native';

const TRAVEL_COMPANIONS = [
    { id: 'solo', label: 'Solo', Icon: User },
    { id: 'couple', label: 'Couple', Icon: Heart },
    { id: 'family', label: 'Family', Icon: Users },
    { id: 'friends', label: 'Friends', Icon: PartyPopper }
];

interface StepCompanionsProps {
    selectedGroup: string;
    setGroup: (group: string) => void;
}

export const StepCompanions = ({ selectedGroup, setGroup }: StepCompanionsProps) => {

    const handleSelect = (id: string) => {
        try { Haptics.selectionAsync(); } catch (e) { }
        setGroup(id);
    };

    return (
        <View className="flex-1 px-6 pt-8">
            <Text className="text-white text-3xl font-bold mb-10">
                Who are you traveling with?
            </Text>

            {/* Grid Container */}
            <View className="flex-row flex-wrap justify-between gap-y-4">
                {TRAVEL_COMPANIONS.map((item) => {
                    const isSelected = selectedGroup === item.id;
                    const Icon = item.Icon;

                    return (
                        <Pressable
                            key={item.id}
                            onPress={() => handleSelect(item.id)}
                            // Layout: Fixed width for perfect 2x2 grid
                            style={{ width: '48%', aspectRatio: 1 }}
                        >
                            {({ pressed }) => (
                                <View
                                    className={`flex-1 items-center justify-center rounded-3xl border
                                        ${pressed ? 'opacity-80 scale-95' : 'opacity-100 scale-100'}
                                        ${isSelected
                                            ? 'bg-violet-600/20 border-violet-500' // Glassy Purple
                                            : 'bg-white/10 border-white/5'       // Black Glass (10% opacity)
                                        }`}
                                >
                                    {/* Icon Container with subtle glow on selection */}
                                    <View className={`mb-4 p-3 rounded-full ${isSelected ? 'bg-violet-500/10' : 'bg-transparent'}`}>
                                        <Icon
                                            size={38}
                                            color={isSelected ? '#FFFFFF' : '#D4D4D8'} // White vs Light Gray (Zinc-300)
                                            strokeWidth={isSelected ? 2.5 : 1.5}
                                        />
                                    </View>

                                    <Text className={`text-lg font-semibold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                        {item.label}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};