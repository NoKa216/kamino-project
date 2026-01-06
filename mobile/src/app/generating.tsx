import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Sparkles, Plane, Map, Wallet } from 'lucide-react-native';

const LOADING_MESSAGES = [
    "Curating the best spots for you...",
    "Checking weather patterns...",
    "Finding hidden local gems...",
    "Optimizing for your budget...",
    "Finalizing your dream itinerary..."
];

export default function GeneratingScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [msgIndex, setMsgIndex] = useState(0);

    useEffect(() => {
        const messageInterval = setInterval(() => {
            setMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
        }, 1500);

        const finishTimeout = setTimeout(() => {
            console.log("Trip Generated!");

            // --- FIX: Close all modals instead of replacing route inside the modal ---
            // זה יסגור גם את מסך הטעינה וגם את מסך היצירה, ויחזיר אותך לאפליקציה הראשית (שהיא לא מודל)
            router.dismissAll();

            // אופציונלי: אם תרצה שמיד אחרי הסגירה הוא יעבור לטאב "הטיולים שלי":
            // router.push('/(app)/trips');

        }, 6000);

        return () => {
            clearInterval(messageInterval);
            clearTimeout(finishTimeout);
        };
    }, []);

    const renderIcon = () => {
        const props = { size: 40, color: "#A78BFA" };
        switch (msgIndex % 4) {
            case 0: return <Sparkles {...props} />;
            case 1: return <Plane {...props} />;
            case 2: return <Map {...props} />;
            case 3: return <Wallet {...props} />;
            default: return <Sparkles {...props} />;
        }
    };

    return (
        <View className="flex-1 bg-black items-center justify-center px-6">
            <SafeAreaView className="items-center w-full">

                {/* Animated Icon */}
                <View className="w-24 h-24 rounded-full bg-violet-600/20 items-center justify-center mb-8 border border-violet-500/30">
                    {renderIcon()}
                </View>

                {/* Title */}
                <Text className="text-white text-3xl font-bold text-center mb-4">
                    Planning your trip...
                </Text>

                {/* Message */}
                <Text className="text-neutral-400 text-lg text-center h-8 mb-12">
                    {LOADING_MESSAGES[msgIndex]}
                </Text>

                {/* Spinner */}
                <ActivityIndicator size="large" color="#A78BFA" />

            </SafeAreaView>
        </View>
    );
}