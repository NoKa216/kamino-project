import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, Keyboard, I18nManager, ActivityIndicator } from 'react-native';
import { X, MapPin, Search } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { PlacesService, PlaceResult } from '../../services/places'; // <-- Import Service

interface StepWishesProps {
    mustHaves: string[];
    setMustHaves: (wishes: string[]) => void;
}

export const StepWishes = ({ mustHaves, setMustHaves }: StepWishesProps) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const isRTL = I18nManager.isRTL;

    /**
     * Effect: Debounced Search for Attractions
     * Similar to DestinationInput but requests type='attraction'.
     */
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length > 2) {
                setIsLoading(true);
                setIsSearching(true);
                try {
                    const results = await PlacesService.searchPlaces(query, 'attraction');
                    setSuggestions(results);
                } catch (e) {
                    console.error("[StepWishes] API Error:", e);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setIsSearching(false);
                setSuggestions([]);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    /**
     * Adds an attraction to the list if not already present.
     */
    const addWish = (place: PlaceResult) => {
        const wishName = place.mainText;

        if (!mustHaves.includes(wishName)) {
            try { Haptics.selectionAsync(); } catch (e) { }
            setMustHaves([...mustHaves, wishName]);
        }

        // Reset search state
        setQuery('');
        setSuggestions([]);
        setIsSearching(false);
        Keyboard.dismiss();
    };

    /**
     * Removes an attraction from the list.
     */
    const removeWish = (wishToRemove: string) => {
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) { }
        setMustHaves(mustHaves.filter(w => w !== wishToRemove));
    };

    return (
        <View className="flex-1 px-6 pt-8">
            <Text className="text-white text-3xl font-bold mb-3">Must-see places?</Text>
            <Text className="text-neutral-400 text-base mb-8">Search for specific landmarks or attractions</Text>

            {/* Search Input Field */}
            <View className="relative z-50">
                <View className="flex-row items-center bg-white/10 border border-white/5 rounded-2xl h-14 px-4 mb-2">

                    <Search color="#A1A1AA" size={20} />

                    <TextInput
                        placeholder="e.g. Eiffel Tower"
                        placeholderTextColor="#52525B"
                        className="flex-1 text-white text-base font-medium h-full mx-3"
                        value={query}
                        onChangeText={setQuery}
                        textAlign={isRTL ? 'right' : 'left'}
                    />

                    {isLoading ? (
                        <ActivityIndicator size="small" color="#A78BFA" />
                    ) : query.length > 0 ? (
                        <TouchableOpacity onPress={() => { setQuery(''); setIsSearching(false); }}>
                            <X color="#A1A1AA" size={18} />
                        </TouchableOpacity>
                    ) : null}
                </View>

                {/* Autocomplete Suggestions Dropdown */}
                {isSearching && suggestions.length > 0 && (
                    <View className="absolute top-16 left-0 right-0 bg-[#1C1C1E] border border-white/10 rounded-2xl overflow-hidden shadow-lg z-50">
                        {suggestions.map((item, index) => (
                            <TouchableOpacity
                                key={item.placeId || index}
                                onPress={() => addWish(item)}
                                className="flex-row items-center p-4 border-b border-white/5 active:bg-white/5"
                                style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                            >
                                <View className="bg-white/10 p-2 rounded-full mx-3">
                                    <MapPin size={16} color="#A78BFA" />
                                </View>
                                <View className="flex-1">
                                    <Text className={`text-white font-medium text-base ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {item.mainText}
                                    </Text>
                                    {item.secondaryText ? (
                                        <Text className={`text-zinc-500 text-xs ${isRTL ? 'text-right' : 'text-left'}`}>
                                            {item.secondaryText}
                                        </Text>
                                    ) : null}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Selected Chips */}
            <View className="flex-row flex-wrap gap-3 mt-4">
                {mustHaves.map((item, index) => (
                    <Pressable
                        key={index}
                        onPress={() => removeWish(item)}
                    >
                        {({ pressed }) => (
                            <View
                                className={`flex-row items-center px-4 py-2.5 rounded-full border 
                                    ${pressed ? 'opacity-70' : 'opacity-100'}
                                    bg-violet-600/20 border-violet-500`}
                            >
                                <MapPin size={14} color="#A78BFA" style={{ marginRight: 6 }} />
                                <Text className="text-white font-medium mr-2">{item}</Text>
                                <X size={14} color="rgba(255,255,255,0.6)" />
                            </View>
                        )}
                    </Pressable>
                ))}
            </View>

            {/* Empty State */}
            {mustHaves.length === 0 && !isSearching && !isLoading && (
                <View className="mt-10 items-center justify-center opacity-30">
                    <MapPin size={48} color="white" />
                    <Text className="text-white text-center mt-4">
                        Add places you don't want to miss!
                    </Text>
                </View>
            )}
        </View>
    );
};