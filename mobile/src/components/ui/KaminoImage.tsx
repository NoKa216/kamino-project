/**
 * KaminoImage - Optimized Image Component
 * Wrapper around expo-image with performance defaults for the Kamino app.
 * Fixed: Removed light Blurhash to prevent white flash on loading.
 */

import React, { memo } from 'react';
import { StyleSheet, View, StyleProp } from 'react-native';
import { Image, ImageSource, ImageContentFit, ImageStyle } from 'expo-image';

interface KaminoImageProps {
    /** Image source - can be URL string or require() */
    source: string | ImageSource | null | undefined;
    /** Optional style for the image */
    style?: StyleProp<ImageStyle>;
    /** Content fit mode - defaults to 'cover' */
    contentFit?: ImageContentFit;
    /** Transition duration in ms - defaults to 500 */
    transition?: number;
    /** Whether to show placeholder while loading - defaults to false (uses background color) */
    showPlaceholder?: boolean;
    /** Alt text for accessibility */
    alt?: string;
    /** Priority for image loading */
    priority?: 'low' | 'normal' | 'high';
}

/**
 * High-performance image component with caching and smooth transitions.
 * Use this instead of standard <Image /> for all remote images.
 */
export const KaminoImage = memo<KaminoImageProps>(({
    source,
    style,
    contentFit = 'cover',
    transition = 500, // Smooth 0.5s fade-in
    showPlaceholder = false, // DISABLED BLURHASH by default to prevent white flash
    alt,
    priority = 'normal',
}) => {
    // Handle empty source
    if (!source) {
        return <View style={[styles.placeholder, style]} />;
    }

    // Normalize source to ImageSource format
    const imageSource: ImageSource = typeof source === 'string'
        ? { uri: source }
        : source;

    return (
        <Image
            source={imageSource}
            style={[styles.image, style]}
            contentFit={contentFit}
            transition={transition}
            // Removed blurhash prop completely to ensure strict dark background
            cachePolicy="memory-disk"
            priority={priority}
            alt={alt}
            recyclingKey={imageSource.uri}
        />
    );
});

KaminoImage.displayName = 'KaminoImage';

const styles = StyleSheet.create({
    image: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#121212', // Dark placeholder background (Matches SwipeableCard)
    },
    placeholder: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: '#121212',
    },
});

export default KaminoImage;