import React, { useState, useRef, useCallback } from 'react';
import {
    View, Text, Animated, Dimensions,
    KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronLeft } from 'lucide-react-native';
import { useAuthActions } from '../../hooks/useAuthActions';
import {
    MainAuthView, EmailLoginView, SignUpView, ForgotPasswordView
} from '../../components/auth';
import { AuthLayout } from '../../components/auth/AuthLayout';

const { height } = Dimensions.get('window');
type AuthView = 'MAIN' | 'EMAIL_LOGIN' | 'SIGN_UP' | 'FORGOT_PASSWORD';

export default function AuthScreen() {
    const [currentView, setCurrentView] = useState<AuthView>('MAIN');
    const slideAnim = useRef(new Animated.Value(0)).current;

    const {
        isLoading, control, errors, onLogin, onSignUp, onSkip,
        onGoogleSignIn, onAppleSignIn, onForgotPassword
    } = useAuthActions();

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
        <AuthLayout isLoading={isLoading}>
            <SafeAreaView className="flex-1" edges={['top']}>

                {/* Navigation Header */}
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

                {/* Dark Glass Modal */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 justify-end"
                >
                    <Animated.View style={{ transform: [{ translateY: slideAnim }] }} className="w-full">
                        <View className="bg-black/50 px-10 pt-10 pb-20 rounded-t-[50px] border-t border-white/10 backdrop-blur-md">

                            {currentView === 'MAIN' && (
                                <MainAuthView
                                    onEmailPress={() => transitionTo('EMAIL_LOGIN')}
                                    onGooglePress={onGoogleSignIn}
                                    onApplePress={onAppleSignIn}
                                    onFacebookPress={() => { }}
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
                                    onResetPress={onForgotPassword}
                                    onBackToLogin={() => transitionTo('EMAIL_LOGIN')}
                                />
                            )}

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
        </AuthLayout>
    );
}