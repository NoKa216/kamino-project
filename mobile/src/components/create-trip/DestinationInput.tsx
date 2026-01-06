import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard, I18nManager, ActivityIndicator } from 'react-native';
import { MapPin, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { PlacesService, PlaceResult } from '../../services/places';

interface DestinationInputProps {
    value: string;
    onChange: (text: string) => void;
}

export const DestinationInput = ({ value, onChange }: DestinationInputProps) => {
    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isTyping = useRef(false);

    const isRTL = I18nManager.isRTL;

    // --- FIX: Auto-Resolve Logic ---
    // האפקט הזה רץ כשהערך מגיע מבחוץ (למשל מ-Explore)
    useEffect(() => {
        // אם הגיע ערך חדש והוא שונה ממה שיש לנו כרגע (כלומר זה טעינה ראשונית ולא הקלדה)
        if (value && value !== query) {
            isTyping.current = false;
            setQuery(value);

            // פונקציה פנימית למציאת ההתאמה הטובה ביותר אוטומטית
            const autoSelectBestMatch = async () => {
                try {
                    setIsLoading(true);
                    // 1. מחפשים בגוגל את השם המקורי (למשל "Santorini")
                    const results = await PlacesService.searchPlaces(value, 'city');

                    // 2. אם יש תוצאות, לוקחים את הראשונה באופן אוטומטי
                    if (results.length > 0) {
                        const bestMatch = results[0];
                        const fullText = bestMatch.description || bestMatch.mainText;

                        // 3. מעדכנים את השדה ואת האבא עם השם המלא ("Santorini, Greece")
                        setQuery(fullText);
                        onChange(fullText);
                    }
                } catch (error) {
                    console.error("Auto-resolve error:", error);
                } finally {
                    setIsLoading(false);
                }
            };

            // מריצים את הבחירה האוטומטית
            autoSelectBestMatch();
        }
    }, [value]);

    // --- לוגיקת חיפוש רגילה (הקלדה) ---
    useEffect(() => {
        if (!isTyping.current) return;

        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 2) {
                try {
                    setIsLoading(true);
                    const results = await PlacesService.searchPlaces(query, 'city');
                    setSuggestions(results);

                    if (results.length > 0) {
                        setShowSuggestions(true);
                    }
                } catch (error) {
                    console.error("API Error:", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleSelect = (item: PlaceResult) => {
        isTyping.current = false;
        const fullText = item.description || item.mainText;
        setQuery(fullText);
        onChange(fullText);
        setShowSuggestions(false);
        setSuggestions([]);
        Keyboard.dismiss();
        Haptics.selectionAsync();
    };

    const handleChangeText = (text: string) => {
        isTyping.current = true;
        setQuery(text);
        if (value !== '') onChange('');
        if (text.length > 0) setShowSuggestions(true);
    };

    const handleClear = () => {
        isTyping.current = false;
        setQuery('');
        onChange('');
        setSuggestions([]);
        setShowSuggestions(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

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
                        writingDirection={isRTL ? 'rtl' : 'ltr'}
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