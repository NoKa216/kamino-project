/**
 * useDestinationSearch Hook
 * 
 * Encapsulates all destination search business logic:
 * - Debounced search with PlacesService
 * - Auto-resolve from external value
 * - Suggestion management
 * 
 * Component only handles rendering.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Keyboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import { PlacesService, PlaceResult } from '../services/places';

interface UseDestinationSearchProps {
    initialValue: string;
    onSelect: (value: string) => void;
}

interface UseDestinationSearchReturn {
    query: string;
    suggestions: PlaceResult[];
    showSuggestions: boolean;
    isLoading: boolean;
    handleChangeText: (text: string) => void;
    handleSelect: (item: PlaceResult) => void;
    handleClear: () => void;
}

export function useDestinationSearch({
    initialValue,
    onSelect,
}: UseDestinationSearchProps): UseDestinationSearchReturn {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<PlaceResult[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isTyping = useRef(false);

    // Auto-resolve when external value changes (e.g., from Explore screen)
    useEffect(() => {
        if (initialValue && initialValue !== query && !isTyping.current) {
            setQuery(initialValue);
            autoSelectBestMatch(initialValue);
        }
    }, [initialValue]);

    // Debounced search on user typing
    useEffect(() => {
        if (!isTyping.current) return;

        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 2) {
                await searchPlaces(query);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    /**
     * Search for places via backend
     */
    const searchPlaces = async (searchQuery: string) => {
        try {
            setIsLoading(true);
            const results = await PlacesService.searchPlaces(searchQuery, 'city');
            setSuggestions(results);
            if (results.length > 0) {
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error('[useDestinationSearch] Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Automatically select best match for pre-filled values
     */
    const autoSelectBestMatch = async (searchValue: string) => {
        try {
            setIsLoading(true);
            const results = await PlacesService.searchPlaces(searchValue, 'city');

            if (results.length > 0) {
                const bestMatch = results[0];
                const fullText = bestMatch.description || bestMatch.mainText;
                setQuery(fullText);
                onSelect(fullText);
            }
        } catch (error) {
            console.error('[useDestinationSearch] Auto-resolve error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle user text input
     */
    const handleChangeText = useCallback((text: string) => {
        isTyping.current = true;
        setQuery(text);
        if (text.length > 0) setShowSuggestions(true);
    }, []);

    /**
     * Handle suggestion selection
     */
    const handleSelect = useCallback((item: PlaceResult) => {
        isTyping.current = false;
        const fullText = item.description || item.mainText;
        setQuery(fullText);
        onSelect(fullText);
        setShowSuggestions(false);
        setSuggestions([]);
        Keyboard.dismiss();
        Haptics.selectionAsync();
    }, [onSelect]);

    /**
     * Clear input and suggestions
     */
    const handleClear = useCallback(() => {
        isTyping.current = false;
        setQuery('');
        onSelect('');
        setSuggestions([]);
        setShowSuggestions(false);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, [onSelect]);

    return {
        query,
        suggestions,
        showSuggestions,
        isLoading,
        handleChangeText,
        handleSelect,
        handleClear,
    };
}
