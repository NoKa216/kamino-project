import React from 'react';
import { View, Dimensions } from 'react-native';
import LottieView from 'lottie-react-native';

const { width } = Dimensions.get('window');

/**
 * Global Loader Component
 * Displays a premium Lottie animation (Paper Plane) on a dark background.
 * Used during initial app load and heavy data fetching.
 */
export const Loader = () => {
    return (
        <View className="flex-1 bg-[#050505] items-center justify-center z-50">
            <LottieView
                // וודא שהקובץ קיים בנתיב הזה. אם אין לך, תוריד JSON של מטוס ושמור שם.
                source={require('../../../assets/animations/paper-plane.json')}
                autoPlay
                loop
                style={{
                    width: width * 0.5, // רספונסיבי: 50% מרוחב המסך
                    height: width * 0.5,
                }}
            />
        </View>
    );
};