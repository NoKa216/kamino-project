import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronLeft, Sparkles } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

// --- Imports ---
import { TripProgressBar } from '../components/ui/TripProgressBar';
import { StepOne } from '../components/create-trip/StepOne';
import { StepCompanions } from '../components/create-trip/StepCompanions';
import { StepInterests } from '../components/create-trip/StepInterests';
import { StepBudget } from '../components/create-trip/StepBudget';
import { StepWishes } from '../components/create-trip/StepWishes';

const STEPS_COUNT = 5;

export default function CreateTripScreen() {
    const router = useRouter();
    const { initialDestination } = useLocalSearchParams();

    // --- STATE ---
    // תיקון: מתחילים משלב 1
    const [step, setStep] = useState(1);

    const [tripData, setTripData] = useState({
        destination: '',
        dates: { start: null as Date | null, end: null as Date | null },
        group: '',
        interests: [] as string[],
        budget: '',
        mustHaves: [] as string[]
    });

    useEffect(() => {
        if (initialDestination) {
            setTripData(prev => ({ ...prev, destination: initialDestination as string }));
        }
    }, [initialDestination]);

    const canProceed = () => {
        switch (step) {
            case 1: return !!tripData.destination && !!tripData.dates.start && !!tripData.dates.end;
            case 2: return !!tripData.group;
            case 3: return tripData.interests.length > 0;
            case 4: return !!tripData.budget;
            default: return true;
        }
    };

    const nextStep = () => {
        if (!canProceed()) return;
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) { }
        if (step < STEPS_COUNT) setStep(step + 1);
        else generateTrip();
    };

    const prevStep = () => {
        try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) { }
        if (step > 1) setStep(step - 1);
    };

    const generateTrip = () => {
        try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch (e) { }

        console.log("SENDING TRIP DATA:", tripData);

        router.push({
            pathname: '/generating',
            params: {
                destination: tripData.destination,
                dates: JSON.stringify(tripData.dates),
                group: tripData.group,
                interests: JSON.stringify(tripData.interests),
                budget: tripData.budget,
                mustHaves: JSON.stringify(tripData.mustHaves)
            }
        });
    };

    const handleClose = () => {
        Keyboard.dismiss();
        if (router.canGoBack()) router.back();
        else router.replace('/(app)');
    };

    return (
        <View className="flex-1 bg-black">
            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">

                    {/* Header */}
                    <View className="px-6 pt-2 flex-row items-center justify-between">
                        {step > 1 ? (
                            <TouchableOpacity onPress={prevStep} className="p-2 -ml-2">
                                <View className="flex-row items-center">
                                    <ChevronLeft color="white" size={24} />
                                    <Text className="text-white text-base font-medium ml-1">Back</Text>
                                </View>
                            </TouchableOpacity>
                        ) : <View className="w-16" />}

                        <TouchableOpacity onPress={handleClose} className="bg-white/10 p-2 rounded-full">
                            <X color="white" size={20} />
                        </TouchableOpacity>
                    </View>

                    {/* Progress Bar */}
                    <TripProgressBar currentStep={step} totalSteps={STEPS_COUNT} />

                    {/* Content Steps */}
                    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
                        {step === 1 && (
                            <StepOne
                                destination={tripData.destination}
                                setDestination={(d) => setTripData({ ...tripData, destination: d })}
                                dates={tripData.dates}
                                setDates={(dates) => setTripData({ ...tripData, dates })}
                            />
                        )}
                        {step === 2 && (
                            <StepCompanions
                                selectedGroup={tripData.group}
                                setGroup={(g) => setTripData({ ...tripData, group: g })}
                            />
                        )}
                        {step === 3 && (
                            <StepInterests
                                selectedInterests={tripData.interests}
                                setInterests={(i) => setTripData({ ...tripData, interests: i })}
                            />
                        )}
                        {step === 4 && (
                            <StepBudget
                                selectedBudget={tripData.budget}
                                setBudget={(b) => setTripData({ ...tripData, budget: b })}
                            />
                        )}
                        {step === 5 && (
                            <StepWishes
                                mustHaves={tripData.mustHaves}
                                setMustHaves={(m) => setTripData({ ...tripData, mustHaves: m })}
                            />
                        )}
                    </ScrollView>

                    {/* Footer Button */}
                    <View className="absolute bottom-8 left-6 right-6">
                        <TouchableOpacity
                            onPress={nextStep}
                            disabled={!canProceed()}
                            className={`w-full h-16 rounded-full flex-row items-center justify-center shadow-lg 
                                ${canProceed()
                                    ? (step === STEPS_COUNT ? 'bg-kamino-violet shadow-kamino-violet/40' : 'bg-white')
                                    : 'bg-white/10'
                                }`}
                            activeOpacity={0.8}
                        >
                            {step === STEPS_COUNT && canProceed() && <Sparkles color="white" size={20} style={{ marginRight: 8 }} />}
                            <Text className={`font-bold text-lg ${canProceed() ? (step === STEPS_COUNT ? 'text-white' : 'text-black') : 'text-white/20'}`}>
                                {step === STEPS_COUNT ? 'Generate Itinerary' : 'Next'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}