import React, { useState, useEffect } from 'react'; // הוספת useEffect
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, X } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // הוספת useLocalSearchParams
import * as Haptics from 'expo-haptics';

export default function CreateTripScreen() {
    const router = useRouter();
    // קבלת הפרמטר
    const { initialDestination } = useLocalSearchParams();

    const [destination, setDestination] = useState('');

    // מילוי אוטומטי אם התקבל יעד
    useEffect(() => {
        if (initialDestination) {
            setDestination(initialDestination as string);
        }
    }, [initialDestination]);

    const handleClose = () => {
        Keyboard.dismiss();
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/(app)');
        }
    };

    const handleCreate = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        console.log("Planning trip to:", destination);
    };

    return (
        <View className="flex-1 bg-black">
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <View className="px-6 pt-2 items-end">
                        <TouchableOpacity
                            onPress={handleClose}
                            className="w-10 h-10 bg-white/10 rounded-full items-center justify-center active:bg-white/20"
                        >
                            <X color="white" size={20} />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 px-6 justify-center items-center -mt-20">
                        <View className="w-24 h-24 bg-kamino-violet/20 rounded-full items-center justify-center mb-8 border border-kamino-violet/50 shadow-2xl shadow-kamino-violet">
                            <Sparkles color="#8B5CF6" size={40} fill="#8B5CF6" />
                        </View>

                        <Text className="text-white text-4xl font-black text-center mb-3">
                            Where to next?
                        </Text>

                        <Text className="text-white/50 text-center mb-12 text-lg px-4 leading-7">
                            Tell us your dream destination. Our AI will handle the rest.
                        </Text>

                        <View className={`w-full bg-white/5 border rounded-2xl h-16 justify-center px-4 mb-6 ${destination ? 'border-kamino-violet/50 bg-kamino-violet/5' : 'border-white/10'}`}>
                            <TextInput
                                placeholder="e.g., 'A romantic week in Tokyo'"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                className="text-white text-lg font-medium h-full"
                                value={destination}
                                onChangeText={setDestination}
                                returnKeyType="go"
                                onSubmitEditing={destination ? handleCreate : undefined}
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleCreate}
                            onPressIn={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                            disabled={!destination}
                            className={`w-full h-16 rounded-2xl items-center justify-center shadow-lg ${destination ? 'bg-white' : 'bg-white/10'}`}
                            activeOpacity={0.8}
                        >
                            <Text className={`font-black text-lg uppercase tracking-widest ${destination ? 'text-black' : 'text-white/20'}`}>
                                Start Planning
                            </Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}