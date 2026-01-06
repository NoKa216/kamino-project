import React from 'react';
import { View } from 'react-native';

interface TripProgressBarProps {
    currentStep: number;
    totalSteps: number;
}

export const TripProgressBar = ({ currentStep, totalSteps }: TripProgressBarProps) => {
    return (
        <View style={{
            flexDirection: 'row',
            height: 6,
            gap: 8,
            marginHorizontal: 24,
            marginTop: 24,
            marginBottom: 20
        }}>
            {Array.from({ length: totalSteps }).map((_, index) => {
                const isActive = index + 1 <= currentStep;
                return (
                    <View
                        key={index}
                        style={{
                            flex: 1,
                            borderRadius: 10,
                            backgroundColor: isActive ? '#8B5CF6' : '#333333'
                        }}
                    />
                );
            })}
        </View>
    );
};