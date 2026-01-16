/**
 * DestinationInput - Pure UI Component
 * 
 * Responsibilities:
 * - Render input field and suggestions dropdown
 * - All business logic delegated to useDestinationSearch hook
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, I18nManager, ActivityIndicator } from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import { useDestinationSearch } from '../../hooks/useDestinationSearch';

interface DestinationInputProps {
    value: string;
    onChange: (text: string) => void;
}

export const DestinationInput = ({ value, onChange }: DestinationInputProps) => {
    const {
        query,
        suggestions,
        showSuggestions,
        isLoading,
        handleChangeText,
        handleSelect,
        handleClear,
    } = useDestinationSearch({ initialValue: value, onSelect: onChange });

    const isRTL = I18nManager.isRTL;

    return (
        <View className="z-[100]">
            <Text className="text-white/70 font-bold mb-3 ml-1 text-left">Destination</Text>

            <View className="relative z-[100]">

                {/* Input Container */}
                <View className={`w-full bg-white/5 border rounded-2xl h-14 flex-row items-center px-4 mb-2 ${query ? 'border-kamino-violet/50 bg-kamino-violet/5' : 'border-white/10'}`}>
                    <MapPin size={18} color={query ? '#A78BFA' : 'rgba(255,255,255,0.3)'} />

                    <TextInput
                        placeholder="Where to? (e.g. London)"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        className="flex-1 text-white text-base font-medium ml-3 h-full"
                        value={query}
                        onChangeText={handleChangeText}
                        textAlign={isRTL ? 'right' : 'left'}
                    />

                    {isLoading ? (
                        <ActivityIndicator size="small" color="#A78BFA" />
                    ) : query.length > 0 ? (
                        <TouchableOpacity onPress={handleClear}>
                            <X size={16} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <View className="absolute top-16 w-full bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-xl overflow-hidden z-[100]">
                        {suggestions.map((item, index) => (
                            <TouchableOpacity
                                key={item.placeId || index}
                                className="px-4 py-3 border-b border-white/5 flex-row items-center active:bg-white/10"
                                onPress={() => handleSelect(item)}
                                style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                            >
                                <View className="bg-white/10 p-1.5 rounded-full mr-3">
                                    <MapPin size={14} color="#8B5CF6" />
                                </View>

                                <View className="flex-1">
                                    <Text className={`text-white font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {item.mainText}
                                    </Text>
                                    <Text className={`text-zinc-500 text-xs mt-0.5 ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {item.secondaryText}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>
        </View>
    );
};