import React from 'react';
import { Text } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { DestinationInput } from './DestinationInput';
import { DateRangePicker } from './DateRangePicker';

interface StepOneProps {
    destination: string;
    setDestination: (dest: string) => void;
    dates: { start: Date | null, end: Date | null };
    setDates: (dates: { start: Date | null, end: Date | null }) => void;
}

export const StepOne = ({ destination, setDestination, dates, setDates }: StepOneProps) => {

    const handleDatesChange = (start: Date | null, end: Date | null) => {
        setDates({ start, end });
    };

    return (
        <Animated.View entering={FadeInRight} exiting={FadeOutLeft} className="flex-1 px-6 pt-8">
            <Text className="text-white text-3xl font-bold mb-2">Let's start planning</Text>
            <Text className="text-white/50 text-base mb-8">Tell us where you'd like to go and when</Text>

            <DestinationInput
                value={destination}
                onChange={setDestination}
            />

            <DateRangePicker
                startDate={dates.start}
                endDate={dates.end}
                onDatesChange={handleDatesChange}
            />
        </Animated.View>
    );
};