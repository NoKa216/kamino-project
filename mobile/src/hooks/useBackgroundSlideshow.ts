import { useState, useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export const useBackgroundSlideshow = (imagesCount: number, interval = 7000) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const timer = setInterval(() => {
            Animated.timing(fadeAnim, {
                toValue: 0, duration: 2000, useNativeDriver: true,
            }).start(() => {
                setCurrentIndex((prev) => (prev + 1) % imagesCount);
                Animated.timing(fadeAnim, { toValue: 1, duration: 2000, useNativeDriver: true }).start();
            });
        }, interval);
        return () => clearInterval(timer);
    }, [imagesCount, interval]);

    return { currentIndex, fadeAnim };
};