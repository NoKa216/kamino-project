/**
 * FlightTimeInput - Reusable Time Picker Row
 * 
 * Handles:
 * - Time display (formatted or --:--)
 * - Platform-specific picker (iOS Modal / Android default)
 * - Touch handling
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';

interface FlightTimeInputProps {
    label: string;
    value?: string;  // "HH:mm" format
    onChange: (time: string) => void;
    modalTitle?: string;
}

export function FlightTimeInput({ label, value, onChange, modalTitle }: FlightTimeInputProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [tempTime, setTempTime] = useState<Date>(new Date());

    // Parse "HH:mm" to Date
    const getTimeDate = (timeString?: string) => {
        const d = new Date();
        if (!timeString) return d;
        const [hours, minutes] = timeString.split(':').map(Number);
        d.setHours(hours);
        d.setMinutes(minutes);
        return d;
    };

    // Format Date to "HH:mm"
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // Open picker
    const openPicker = () => {
        setTempTime(getTimeDate(value));
        setShowPicker(true);
    };

    // Android: Handle change directly
    const handleAndroidChange = (event: any, selectedDate?: Date) => {
        setShowPicker(false);
        if (selectedDate && event.type !== 'dismissed') {
            onChange(formatTime(selectedDate));
        }
    };

    // iOS: Confirm selection
    const confirmIOSTime = () => {
        onChange(formatTime(tempTime));
        setShowPicker(false);
    };

    return (
        <View className="mb-4">
            <Text className="text-white/60 text-xs uppercase font-bold mb-2 ml-1">{label}</Text>

            <TouchableOpacity
                onPress={openPicker}
                className="bg-black/40 h-14 rounded-xl flex-row items-center px-4 border border-white/10"
            >
                <Clock color="#A1A1AA" size={18} />
                <Text className="text-white text-base font-medium ml-3">
                    {value || '--:--'}
                </Text>
            </TouchableOpacity>

            {/* Android Picker */}
            {Platform.OS === 'android' && showPicker && (
                <DateTimePicker
                    value={getTimeDate(value)}
                    mode="time"
                    display="default"
                    onChange={handleAndroidChange}
                />
            )}

            {/* iOS Modal Picker */}
            {Platform.OS === 'ios' && (
                <Modal visible={showPicker} transparent animationType="slide">
                    <View className="flex-1 justify-end bg-black/60">
                        <View className="bg-[#1C1C1E] rounded-t-3xl">
                            <View className="flex-row justify-between items-center px-6 py-4 border-b border-white/10">
                                <TouchableOpacity onPress={() => setShowPicker(false)}>
                                    <Text className="text-kamino-violet text-base font-medium">Cancel</Text>
                                </TouchableOpacity>
                                <Text className="text-white text-base font-semibold">{modalTitle || label}</Text>
                                <TouchableOpacity onPress={confirmIOSTime}>
                                    <Text className="text-kamino-violet text-base font-bold">Done</Text>
                                </TouchableOpacity>
                            </View>
                            <DateTimePicker
                                value={tempTime}
                                mode="time"
                                display="spinner"
                                onChange={(e, date) => date && setTempTime(date)}
                                themeVariant="dark"
                                textColor="white"
                                style={{ height: 200 }}
                            />
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
}
