import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Sparkles, Plane, Map, Wallet } from 'lucide-react-native';
import { TripsService } from '../services/trips';

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

        const generate = async () => {
            try {
                // Parse params
                const dest = params.destination as string;
                let datesObj = { start: '', end: '' };
                try {
                    datesObj = JSON.parse(params.dates as string || '{}');
                } catch (e) {
                    console.error('Error parsing dates:', e);
                }

                const interestsList = JSON.parse(params.interests as string || '[]');
                const mustHavesList = JSON.parse(params.mustHaves as string || '[]');

                // Parse logistics data
                let logisticsData = undefined;
                try {
                    logisticsData = JSON.parse(params.logistics as string || 'null');
                } catch (e) {
                    console.error('Error parsing logistics:', e);
                }

                // Merge interests and mustHaves for the AI prompt context
                // UPDATE: Sent separately now for service to handle exclusion vs inclusion context
                const allInterests = [...interestsList]; // Just interests

                const tripData: any = {
                    destination: dest,
                    startDate: datesObj.start,
                    endDate: datesObj.end,
                    travelers: params.group as string,
                    budget: params.budget as string,
                    interests: allInterests,
                    mustHaveItems: mustHavesList, // Send explicitly
                    logistics: logisticsData       // NEW: Pass logistics data
                };

                // Call API
                const result = await TripsService.generateTrip(tripData);
                console.log("Trip Candidates Generated:", result);

                // Invalidate cache so HomeScreen fetches fresh data on next focus
                TripsService.invalidateCache();

                // --- FIX: Navigate to Swipe Screen ---
                if (result.success && result.candidates) {
                    // We dismissAll first to clear the modal wizard stack
                    router.dismissAll();

                    // Then we push the new swipe screen
                    // HACK: Use a slight delay or just push immediately if root allows. 
                    // Since dismissAll goes to root, we should push relative to root.
                    // Note: params must be strings usually.

                    // But wait! `dismissAll` wipes the history. If we are in a tab, we probably just want to go to the new screen?
                    // The user said: "Modify the success callback to navigate to the new Swipe Screen".
                    // The current stack is a Modal stack. If we push from here, we might stay in modal or stack on top.
                    // If we want a full screen experience, we might want to stay in stack?
                    // User Rule from context: "When finishing a wizard flow... use router.dismissAll()".
                    // But here we are moving to a "Discovery Phase". Is that part of wizard or app?
                    // "Create SwipeScreen at src/app/(app)/trip/[id]/swipe.tsx". This implies it is inside the main app layout.
                    // So we MUST dismissAll() (to close the modal) AND then navigate to the page in the main app.

                    setTimeout(() => {
                        router.push({
                            pathname: '/(app)/trip/[id]/swipe',
                            params: {
                                id: result.tripId || result.id || '',
                                candidates: JSON.stringify(result.candidates)
                            }
                        });
                    }, 100);
                } else {
                    throw new Error("Invalid response from server");
                }

            } catch (error) {
                console.error("Generation failed:", error);
                alert("Failed to plan trip. Please try again.");
                router.dismissAll(); // safe fallback
            }
        };

        // Add a small delay so the user sees at least one message/animation cycle
        const startTimeout = setTimeout(() => {
            generate();
        }, 2000);

        return () => {
            clearInterval(messageInterval);
            clearTimeout(startTimeout);
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