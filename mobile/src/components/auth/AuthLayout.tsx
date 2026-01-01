import React from 'react';
import { View, Animated, StyleSheet, StatusBar, ImageSourcePropType, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useBackgroundSlideshow } from '../../hooks/useBackgroundSlideshow';
import { Loader } from '../ui/Loader';

const { width, height } = Dimensions.get('window');

/**
 * Static Asset Configuration:
 * Pre-loading local images avoids network latency and layout shifts.
 * NOTE: Ensure the file extensions (.jpg/.jpeg) match the actual files in 'assets/auth-bg'.
 */
const BACKGROUND_IMAGES: ImageSourcePropType[] = [
    require('../../../assets/auth-bg/bg1.jpg'),
    require('../../../assets/auth-bg/bg2.jpg'),
    require('../../../assets/auth-bg/bg3.jpg'),
    require('../../../assets/auth-bg/bg4.jpg'),
    require('../../../assets/auth-bg/bg5.jpg'),
    require('../../../assets/auth-bg/bg6.jpg'),
];

interface Props {
    children: React.ReactNode;
    isLoading?: boolean;
}

/**
 * AuthLayout Component
 * Implements a "Cinematic Dark Mode" UI architecture.
 * * Strategy:
 * 1. Full-screen background images using 'cover' mode (immersive experience).
 * 2. Heavy linear gradients to darken the top/bottom edges, solving the 
 * aspect-ratio cropping issue by fading out the cut-off areas.
 * 3. Central "Spotlight" effect to focus attention on the content.
 */
export const AuthLayout = ({ children, isLoading = false }: Props) => {
    // Custom hook manages the cross-fade animation logic independently
    const { currentIndex, fadeAnim } = useBackgroundSlideshow(BACKGROUND_IMAGES.length);

    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>
            {/* Status Bar: Force light content to ensure visibility against the dark backdrop */}
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* --- Layer 1: Immersive Background --- */}
            {/* We use 'resizeMode="cover"' to fill the entire screen height.
                While this crops the image sides on tall devices, the gradient overlay (Layer 2)
                masks these imperfections, creating a seamless look.
            */}
            <Animated.Image
                source={BACKGROUND_IMAGES[currentIndex]}
                style={[
                    StyleSheet.absoluteFillObject,
                    { opacity: fadeAnim, width, height }
                ]}
                resizeMode="cover"
            />

            {/* --- Layer 2: Cinematic Gradient Overlay --- */}
            {/* The key to the professional look:
                - Top (0%): 70% opacity black (Legibility for Status Bar/Header)
                - Center (40%): Transparent (Reveals the image subject)
                - Bottom (100%): 95% opacity black (Seamless blend for the Bottom Sheet)
            */}
            <LinearGradient
                colors={['rgba(0,0,0,0.7)', 'transparent', 'rgba(0,0,0,0.95)']}
                locations={[0, 0.4, 1]}
                style={StyleSheet.absoluteFillObject}
            />

            {/* --- Layer 3: Content Container --- */}
            {/* zIndex ensures interactive elements float above the background stack */}
            <View style={{ flex: 1, zIndex: 10 }}>
                {isLoading ? <Loader /> : children}
            </View>
        </View>
    );
};