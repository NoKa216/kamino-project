import React, { useState, useRef, useCallback } from 'react';
import {
    View, Text, Animated, StyleSheet, StatusBar, Dimensions,
    KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronLeft } from 'lucide-react-native';

// Hooks & Logic
import { useBackgroundSlideshow } from '../../hooks/useBackgroundSlideshow';
import { useAuthActions } from '../../hooks/useAuthActions';

// Components (Barrel Import)
import {
    MainAuthView, EmailLoginView, SignUpView, ForgotPasswordView
} from '../../components/auth';

// --- Constants ---
const { height } = Dimensions.get('window');
const BACKGROUND_IMAGES = [
    { uri: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144' },
    { uri: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2156' },
    { uri: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070' }
];

type AuthView = 'MAIN' | 'EMAIL_LOGIN' | 'SIGN_UP' | 'FORGOT_PASSWORD';

export default function AuthScreen() {
    // 1. UI State & Animation Refs
    const [currentView, setCurrentView] = useState<AuthView>('MAIN');
    const slideAnim = useRef(new Animated.Value(0)).current;

    // 2. Custom Hooks
    const { currentIndex, fadeAnim } = useBackgroundSlideshow(BACKGROUND_IMAGES.length);

    // Destructure all auth actions including the new social handlers
    const {
        isLoading, control, errors, onLogin, onSignUp, onSkip,
        onGoogleSignIn, onAppleSignIn, onFacebookSignIn
    } = useAuthActions();

    // 3. Navigation Logic with Animation (Slide Up/Down)
    const transitionTo = useCallback((view: AuthView) => {
        Animated.timing(slideAnim, {
            toValue: height * 0.6,
            duration: 250,
            useNativeDriver: true
        }).start(() => {
            setCurrentView(view);
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 25,
                friction: 8,
                useNativeDriver: true
            }).start();
        });
    }, [slideAnim]);

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Background Slideshow Layer */}
            <Animated.Image
                source={BACKGROUND_IMAGES[currentIndex]}
                style={{ opacity: fadeAnim, ...StyleSheet.absoluteFillObject }}
                resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/45" />

            <SafeAreaView className="flex-1" edges={['top']}>
                {/* Header: Navigation Controls */}
                <View className="flex-row justify-between px-6 pt-4">
                    {currentView !== 'MAIN' ? (
                        <TouchableOpacity
                            onPress={() => transitionTo('MAIN')}
                            className="bg-black/30 p-2.5 rounded-full border border-white/10 active:opacity-70"
                        >
                            <ChevronLeft color="white" size={20} />
                        </TouchableOpacity>
                    ) : <View />}

                    <TouchableOpacity
                        onPress={onSkip}
                        disabled={isLoading}
                        className="bg-black/30 p-2.5 rounded-full border border-white/10 flex-row items-center px-5 active:opacity-70"
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="white" />
                        ) : (
                            <>
                                <Text className="text-white/70 text-[10px] font-black uppercase tracking-[2px] mr-2">Skip</Text>
                                <X color="rgba(255,255,255,0.7)" size={16} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Main Content Modal */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 justify-end"
                >
                    <Animated.View style={{ transform: [{ translateY: slideAnim }] }} className="w-full">
                        <View className="bg-black/50 px-10 pt-10 pb-20 rounded-t-[50px] border-t border-white/5">

                            {/* View Router */}
                            {currentView === 'MAIN' && (
                                <MainAuthView
                                    onEmailPress={() => transitionTo('EMAIL_LOGIN')}
                                    onGooglePress={onGoogleSignIn}
                                    onApplePress={onAppleSignIn}
                                    onFacebookPress={onFacebookSignIn}
                                />
                            )}

                            {currentView === 'EMAIL_LOGIN' && (
                                <EmailLoginView
                                    control={control}
                                    errors={errors}
                                    onLogin={onLogin}
                                    isLoading={isLoading}
                                    onSignUpPress={() => transitionTo('SIGN_UP')}
                                    onForgotPasswordPress={() => transitionTo('FORGOT_PASSWORD')}
                                />
                            )}

                            {currentView === 'SIGN_UP' && (
                                <SignUpView
                                    control={control}
                                    errors={errors}
                                    onSignUp={onSignUp}
                                    isLoading={isLoading}
                                    onLoginPress={() => transitionTo('EMAIL_LOGIN')}
                                />
                            )}

                            {currentView === 'FORGOT_PASSWORD' && (
                                <ForgotPasswordView
                                    control={control}
                                    errors={errors}
                                    onBackToLogin={() => transitionTo('EMAIL_LOGIN')}
                                />
                            )}

                            {/* Footer / Legal */}
                            <View className="mt-14 px-8">
                                <Text className="text-white/30 text-[9px] text-center leading-4 uppercase tracking-tighter">
                                    By continuing, you agree to Kamino's {' '}
                                    <Text className="text-white/60 font-bold underline">Terms of Service</Text> & {' '}
                                    <Text className="text-white/60 font-bold underline">Privacy Policy</Text>.
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}