import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

interface DateRangePickerProps {
    startDate: Date | null;
    endDate: Date | null;
    onDatesChange: (start: Date | null, end: Date | null) => void;
}

export const DateRangePicker = ({ startDate, endDate, onDatesChange }: DateRangePickerProps) => {
    const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);
    const [tempDate, setTempDate] = useState<Date>(new Date());

    const handleOpenPicker = (type: 'start' | 'end') => {
        // אם פותחים את ה-End picker ואין תאריך התחלה, נשתמש בהיום.
        // אם יש תאריך התחלה, הברירת מחדל היא תאריך ההתחלה.
        let defaultDate = new Date();

        if (type === 'start') {
            defaultDate = startDate || new Date();
        } else {
            // בבחירת תאריך סיום, אם כבר נבחר, נציג אותו. אחרת, נתחיל מתאריך ההתחלה (או מהיום)
            defaultDate = endDate || startDate || new Date();
        }

        setTempDate(defaultDate);
        setShowPicker(type);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (!selectedDate) return;

        if (Platform.OS === 'android') {
            setShowPicker(null);
            if (event.type === 'set') {
                applyDateChange(selectedDate);
            }
        } else {
            setTempDate(selectedDate);
        }
    };

    const applyDateChange = (date: Date) => {
        if (showPicker === 'start') {
            // אם תאריך ההתחלה החדש הוא אחרי תאריך הסיום הקיים, נאפס את הסיום
            // כדי למנוע מצב לא הגיוני
            const newEnd = (endDate && date > endDate) ? null : endDate;
            onDatesChange(date, newEnd);
        } else {
            // תאריך סיום נבחר
            onDatesChange(startDate, date);
        }
    };

    const handleIOSConfirm = () => {
        applyDateChange(tempDate);
        setShowPicker(null);
    };

    const formatDate = (date: Date | null) => {
        if (!date) return 'Select Date';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // FIX: חישוב תאריך המינימום
    // ב-Check In: המינימום הוא היום.
    // ב-Check Out: המינימום הוא תאריך ה-Check In שנבחר (או היום אם לא נבחר).
    const getMinimumDate = () => {
        if (showPicker === 'end' && startDate) {
            return startDate;
        }
        return new Date(); // Today
    };

    return (
        <View className="mt-4">
            <Text className="text-white/70 font-bold mb-3 ml-1 text-left">Travel dates</Text>
            <View className="flex-row gap-4">
                {/* Start Date Button */}
                <TouchableOpacity
                    className={`flex-1 bg-white/5 border rounded-2xl p-4 h-24 justify-center ${startDate ? 'border-kamino-violet/50' : 'border-white/10'}`}
                    onPress={() => handleOpenPicker('start')}
                >
                    <View className="flex-row items-center mb-2">
                        <Calendar size={14} color="rgba(255,255,255,0.4)" />
                        <Text className="text-white/40 text-[10px] uppercase font-bold ml-1.5">Check in</Text>
                    </View>
                    <Text className={`text-xl font-bold ${startDate ? 'text-white' : 'text-white/30'}`}>
                        {formatDate(startDate)}
                    </Text>
                </TouchableOpacity>

                {/* End Date Button */}
                <TouchableOpacity
                    className={`flex-1 bg-white/5 border rounded-2xl p-4 h-24 justify-center ${endDate ? 'border-kamino-violet/50' : 'border-white/10'}`}
                    onPress={() => handleOpenPicker('end')}
                // אופציונלי: למנוע לחיצה אם אין עדיין תאריך התחלה
                // disabled={!startDate} 
                >
                    <View className="flex-row items-center mb-2">
                        <Calendar size={14} color="rgba(255,255,255,0.4)" />
                        <Text className="text-white/40 text-[10px] uppercase font-bold ml-1.5">Check out</Text>
                    </View>
                    <Text className={`text-xl font-bold ${endDate ? 'text-white' : 'text-white/30'}`}>
                        {formatDate(endDate)}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* --- IOS MODAL PICKER --- */}
            {Platform.OS === 'ios' && (
                <Modal
                    transparent={true}
                    visible={!!showPicker}
                    animationType="fade"
                >
                    <View className="flex-1 justify-end bg-black/80">
                        <View className="bg-[#1A1A1A] rounded-t-3xl border-t border-white/10 pb-10">
                            {/* Toolbar */}
                            <View className="flex-row justify-between items-center p-4 border-b border-white/10">
                                <TouchableOpacity onPress={() => setShowPicker(null)}>
                                    <Text className="text-white/60 text-base">Cancel</Text>
                                </TouchableOpacity>
                                <Text className="text-white font-bold">
                                    {showPicker === 'start' ? 'Select Check-in' : 'Select Check-out'}
                                </Text>
                                <TouchableOpacity onPress={handleIOSConfirm}>
                                    <Text className="text-kamino-violet font-bold text-base">Done</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="items-center justify-center pt-4">
                                <DateTimePicker
                                    value={tempDate}
                                    mode="date"
                                    display="spinner"
                                    onChange={handleDateChange}
                                    textColor="white"
                                    themeVariant="dark"
                                    // FIX: מונע בחירת תאריכים לא חוקיים
                                    minimumDate={getMinimumDate()}
                                    style={{ height: 200, width: '100%' }}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {/* --- ANDROID PICKER --- */}
            {Platform.OS === 'android' && showPicker && (
                <DateTimePicker
                    value={showPicker === 'start' ? (startDate || new Date()) : (endDate || startDate || new Date())}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    // FIX: מונע בחירת תאריכים לא חוקיים
                    minimumDate={getMinimumDate()}
                />
            )}
        </View>
    );
};