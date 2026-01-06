import React from 'react';
import { View, Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CircleDollarSign, BadgeDollarSign, Wallet } from 'lucide-react-native';

// --- Types & Data ---
const BUDGET_TIERS = [
    {
        id: 'saver',
        label: 'Budget Saver',
        value: '$',
        desc: 'Street food & public transport',

    },
    {
        id: 'standard',
        label: 'Comfort Standard',
        value: '$$',
        desc: 'Mid-range hotels & dining',

    },
    {
        id: 'luxury',
        label: 'Luxury & Pamper',
        value: '$$$',
        desc: 'High-end experiences',
    },
];

interface StepBudgetProps {
    selectedBudget: string;
    setBudget: (budget: string) => void;
}

// --- Component ---
export const StepBudget = ({ selectedBudget, setBudget }: StepBudgetProps) => {

    const handleSelect = (id: string) => {
        try { Haptics.selectionAsync(); } catch (e) { }
        setBudget(id);
    };

    return (
        <View className="flex-1 px-6 pt-8">
            <Text className="text-white text-3xl font-bold mb-3">What's your budget?</Text>
            <Text className="text-neutral-400 text-base mb-8">Choose spending style per person</Text>

            <View className="gap-4">
                {BUDGET_TIERS.map((tier) => {
                    const isSelected = selectedBudget === tier.id;
                    return (
                        <Pressable
                            key={tier.id}
                            onPress={() => handleSelect(tier.id)}
                        >
                            {({ pressed }) => (
                                <View
                                    // עיצוב תואם לשלבים הקודמים (Glassmorphism)
                                    // הסרנו את transition-all
                                    className={`flex-row items-center p-5 rounded-3xl border
                                        ${pressed ? 'opacity-80 scale-[0.98]' : 'opacity-100 scale-100'}
                                        ${isSelected
                                            ? 'bg-violet-600/20 border-violet-500' // נבחר: זכוכית סגולה
                                            : 'bg-white/5 border-white/5'          // לא נבחר: זכוכית כהה
                                        }`}
                                >
                                    {/* Icon Circle */}
                                    <View
                                        className={`w-14 h-14 rounded-full items-center justify-center mr-5
                                            ${isSelected ? 'bg-violet-500/20' : 'bg-white/5'}`}
                                    >
                                        <Text className={`font-bold text-xl ${isSelected ? 'text-violet-300' : 'text-zinc-500'}`}>
                                            {tier.value}
                                        </Text>
                                    </View>

                                    {/* Text Content */}
                                    <View className="flex-1">
                                        <Text className={`text-lg font-bold mb-1 ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                                            {tier.label}
                                        </Text>
                                        <Text className="text-zinc-500 text-sm">
                                            {tier.desc}
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};