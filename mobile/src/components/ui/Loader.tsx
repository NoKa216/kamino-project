import React from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

/**
 * Loader Component
 * Displays a Lottie animation (Paper Plane) centered on the screen.
 * Used for loading states and data synchronization pauses.
 */
export const Loader = () => {
    return (
        <View style={styles.container}>
            <LottieView
                // Ensure this file exists in your assets folder!
                source={require('../../../assets/animations/paper-plane.json')}
                autoPlay
                loop
                style={{ width: 150, height: 150 }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent', // Transparent to blend with parent layouts
    },
});