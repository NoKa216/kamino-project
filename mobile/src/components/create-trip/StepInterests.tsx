import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Search } from 'lucide-react-native';

// Import data from shared file
import { INTERESTS_DATA } from '../../constants/interests';

interface StepInterestsProps {
    selectedInterests: string[];
    setInterests: (interests: string[]) => void;
}

export const StepInterests = ({ selectedInterests, setInterests }: StepInterestsProps) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredInterests = INTERESTS_DATA.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleInterest = (id: string) => {
        try { Haptics.selectionAsync(); } catch (e) { }

        if (selectedInterests.includes(id)) {
            setInterests(selectedInterests.filter(i => i !== id));
        } else {
            if (selectedInterests.length < 10) {
                setInterests([...selectedInterests, id]);
            } else {
                try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch (e) { }
            }
        }
    };

    return (
        <View className="flex-1 px-6 pt-8">
            <Text className="text-white text-3xl font-bold mb-3">
                What are you into?
            </Text>
            <Text className="text-neutral-400 text-base mb-6">
                Select up to 10 interests ({selectedInterests.length}/10)
            </Text>

            {/* Search Bar */}
            <View className="flex-row items-center bg-white/10 border border-white/5 rounded-2xl px-4 h-14 mb-6">
                <Search size={20} color="#A1A1AA" />
                <TextInput
                    className="flex-1 ml-3 text-white text-base font-medium"
                    placeholder="Search interests..."
                    placeholderTextColor="#52525B"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* Interests Cloud */}
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row flex-wrap gap-3 pb-32">
                    {filteredInterests.map((item) => {
                        const isSelected = selectedInterests.includes(item.id);
                        const Icon = item.icon;

                        return (
                            <Pressable
                                key={item.id}
                                onPress={() => toggleInterest(item.id)}
                                // FIX: Removed 'transition-all'
                                className={`flex-row items-center px-5 py-3.5 rounded-full border
                                    ${isSelected
                                        ? 'bg-violet-600/20 border-violet-500'
                                        : 'bg-white/5 border-white/5'
                                    }`}
                            >
                                <Icon
                                    size={18}
                                    color={isSelected ? '#A78BFA' : '#A1A1AA'}
                                    strokeWidth={2}
                                />
                                <Text className={`ml-2 font-medium text-[15px] 
                                    ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                    {item.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};