/**
 * useHotelSearch Hook
 * 
 * Specialized version of useDestinationSearch for finding accommodation.
 * - Restricts search to 'lodging' type via PlacesService.
 * - Handles debouncing and state management for the autocomplete UI.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Keyboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PlacesService, PlaceResult } from '../services/places';

interface UseHotelSearchProps {
    initialValue?: string;
    onSelect: (placeName: string, details?: any) => void;
}

interface UseHotelSearchReturn {
    query: string;
    suggestions: PlaceResult[];
    showSuggestions: boolean;
    isLoading: boolean;
    handleChangeText: (text: string) => void;
    handleSelect: (item: PlaceResult) => void;
    handleClear: () => void;
    onFocus: () => void;
}

export function useHotelSearch({
    initialValue = '',
    onSelect,
}: UseHotelSearchProps): UseHotelSearchReturn {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isTyping = useRef(false);

    // Debounced search
    useEffect(() => {
        if (!isTyping.current) return;

        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 2) {
                await searchHotels(query);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // Update query if initialValue changes externally
    useEffect(() => {
        if (initialValue && initialValue !== query && !isTyping.current) {
            setQuery(initialValue);
        }
    }, [initialValue]);

    /**
     * Search specifically for hotels/lodging
     */
    const searchHotels = async (searchQuery: string) => {
        try {
            setIsLoading(true);
            // 'lodging' helps prioritize hotels, though 'textquery' is broad.
            // We rely on the backend proxy or Gemini to interpret this, 
            // strictly depending on how PlacesService.searchPlaces is implemented.
            // If it accepts a type, we pass it.
            const results = await PlacesService.searchPlaces(searchQuery, 'lodging');
            setSuggestions(results);
            if (results.length > 0) {
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('[useHotelSearch] Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangeText = useCallback((text: string) => {
        isTyping.current = true;
        setQuery(text);
        if (text.length === 0) {
            setShowSuggestions(false);
            onSelect(''); // Clear parent state
        }
    }, [onSelect]);

    const handleSelect = useCallback((item: PlaceResult) => {
        isTyping.current = false;
        const fullText = item.description || item.mainText;
        setQuery(fullText);

        // Pass back full details if needed
        onSelect(fullText, item);

        setShowSuggestions(false);
        setSuggestions([]);
        Keyboard.dismiss();
        Haptics.selectionAsync();
    }, [onSelect]);

    const handleClear = useCallback(() => {
        isTyping.current = false;
        setQuery('');
        onSelect('');
        setSuggestions([]);
        setShowSuggestions(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, [onSelect]);

    const onFocus = useCallback(() => {
        if (query.length > 2 && suggestions.length > 0) {
            setShowSuggestions(true);
        }
    }, [query, suggestions]);

    return {
        query,
        suggestions,
        showSuggestions,
        isLoading,
        handleChangeText,
        handleSelect,
        handleClear,
        onFocus
    };
}
