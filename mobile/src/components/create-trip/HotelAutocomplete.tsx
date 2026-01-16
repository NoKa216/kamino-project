import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, I18nManager } from 'react-native';
import { MapPin, X, Building2 } from 'lucide-react-native';
import { useHotelSearch } from '../../hooks/useHotelSearch';

interface HotelAutocompleteProps {
    value?: string;
    onSelect: (hotelName: string) => void;
    placeholder?: string;
}

export const HotelAutocomplete = ({ value, onSelect, placeholder = 'Where are you staying?' }: HotelAutocompleteProps) => {
    const {
        query,
        suggestions,
        showSuggestions,
        isLoading,
        handleChangeText,
        handleSelect,
        handleClear,
        onFocus
    } = useHotelSearch({
        initialValue: value,
        onSelect: (name) => onSelect(name)
    });

    const isRTL = I18nManager.isRTL;
    const [isFocused, setIsFocused] = useState(false);

    // Determine if we should show Text (display mode) or TextInput (edit mode)
    const showDisplayMode = query.length > 0 && !isFocused;

    return (
        <View className="relative z-50">
            {/* Input Container */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => setIsFocused(true)}
                className={`w-full bg-black/40 border rounded-2xl h-14 flex-row items-center px-4 overflow-hidden ${query ? 'border-kamino-violet/50' : 'border-white/10'}`}
            >
                {/* ICON */}
                <View className="flex-shrink-0">
                    <Building2
                        size={18}
                        color={query ? '#A78BFA' : 'rgba(255,255,255,0.3)'}
                    />
                </View>

                {/* DISPLAY MODE: Text with ellipsis (guaranteed single line) */}
                {showDisplayMode ? (
                    <Text
                        className="flex-1 text-white text-base font-medium ml-3"
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {query}
                    </Text>
                ) : (
                    /* EDIT MODE: TextInput for typing */
                    <TextInput
                        className="flex-1 text-white text-base font-medium ml-3 h-full"
                        placeholder={placeholder}
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        value={query}
                        onChangeText={handleChangeText}
                        onFocus={() => {
                            setIsFocused(true);
                            onFocus();
                        }}
                        onBlur={() => setIsFocused(false)}
                        autoCapitalize="words"
                        autoCorrect={false}
                        multiline={false}
                        numberOfLines={1}
                        scrollEnabled={true}
                        autoFocus={isFocused && query.length === 0}
                        style={{
                            paddingVertical: 0,
                            textAlignVertical: 'center',
                            includeFontPadding: false
                        }}
                        textAlign={isRTL ? 'right' : 'left'}
                    />
                )}

                {/* CLEAR BUTTON */}
                <View className="flex-shrink-0">
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#A78BFA" />
                    ) : query.length > 0 ? (
                        <TouchableOpacity
                            onPress={() => {
                                handleClear();
                                setIsFocused(false);
                            }}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <X size={16} color="rgba(255,255,255,0.5)" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </TouchableOpacity>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <View
                    className="absolute top-16 left-0 right-0 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-xl overflow-hidden"
                    style={{
                        zIndex: 9999,
                        elevation: 10,
                    }}
                >
                    {suggestions.map((item, index) => (
                        <TouchableOpacity
                            key={item.placeId}
                            className="px-4 py-3 border-b border-white/5 flex-row items-center active:bg-white/10"
                            onPress={() => {
                                handleSelect(item);
                                setIsFocused(false);
                            }}
                            style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                        >
                            <View className="bg-white/10 p-1.5 rounded-full mr-3">
                                <MapPin size={14} color="#8B5CF6" />
                            </View>

                            <View className="flex-1">
                                <Text
                                    className={`text-white font-medium ${isRTL ? 'text-right' : 'text-left'}`}
                                    numberOfLines={1}
                                >
                                    {item.mainText}
                                </Text>
                                <Text
                                    className={`text-zinc-500 text-xs mt-0.5 ${isRTL ? 'text-right' : 'text-left'}`}
                                    numberOfLines={1}
                                >
                                    {item.secondaryText}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};