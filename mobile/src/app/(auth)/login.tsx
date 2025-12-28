import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, StatusBar, Dimensions, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, ChevronLeft } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';

// ייבוא הקומפוננטות
import { MainAuthView } from '../../components/auth/MainAuthView';
import { EmailLoginView } from '../../components/auth/EmailLoginView';
import { SignUpView } from '../../components/auth/SignUpView';
import { ForgotPasswordView } from '../../components/auth/ForgotPasswordView'; // ייבוא הקומפוננטה החדשה

const { height } = Dimensions.get('window');

const backgroundImages = [
    { uri: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144' },
    { uri: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2156' },
    { uri: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070' }
];

// עדכון הטיפוסים לכלול שחזור סיסמה
type AuthView = 'MAIN' | 'EMAIL_LOGIN' | 'SIGN_UP' | 'FORGOT_PASSWORD';

export default function AuthScreen() {
    const router = useRouter();
    const [currentView, setCurrentView] = useState<AuthView>('MAIN');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const slideAnim = useRef(new Animated.Value(0)).current;
    const bgFadeAnim = useRef(new Animated.Value(1)).current;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    useEffect(() => {
        const timer = setInterval(() => {
            Animated.timing(bgFadeAnim, {
                toValue: 0, duration: 2000, useNativeDriver: true,
            }).start(() => {
                setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
                Animated.timing(bgFadeAnim, { toValue: 1, duration: 2000, useNativeDriver: true }).start();
            });
        }, 7000);
        return () => clearInterval(timer);
    }, []);

    const transitionTo = (view: AuthView) => {
        // אנימציית ירידה של המודל, החלפת תוכן, ועליה חזרה למראה חלק
        Animated.timing(slideAnim, {
            toValue: height * 0.6,
            duration: 300,
            useNativeDriver: true
        }).start(() => {
            setCurrentView(view);
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 20,
                friction: 8,
                useNativeDriver: true
            }).start();
        });
    };

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <Animated.Image
                source={backgroundImages[currentImageIndex]}
                style={{ opacity: bgFadeAnim, ...StyleSheet.absoluteFillObject }}
                resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/40" />

            <SafeAreaView className="flex-1" edges={['top']}>
                <View className="flex-row justify-between px-6 pt-2">
                    {currentView !== 'MAIN' ? (
                        <TouchableOpacity
                            onPress={() => transitionTo('MAIN')}
                            className="bg-black/20 p-2 rounded-full border border-white/10"
                        >
                            <ChevronLeft color="white" size={20} />
                        </TouchableOpacity>
                    ) : <View />}

                    <TouchableOpacity
                        onPress={() => router.replace('/(app)')}
                        className="bg-black/20 p-2 rounded-full border border-white/10 flex-row items-center px-4"
                    >
                        <Text className="text-white/60 text-[10px] font-bold uppercase tracking-[2px] mr-2">Skip</Text>
                        <X color="rgba(255,255,255,0.6)" size={16} />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 justify-end"
                >
                    <Animated.View style={{ transform: [{ translateY: slideAnim }] }} className="w-full">
                        <View className="bg-black/45 px-10 pt-10 pb-20 rounded-t-[50px]">

                            {currentView === 'MAIN' && (
                                <MainAuthView onEmailPress={() => transitionTo('EMAIL_LOGIN')} />
                            )}

                            {currentView === 'EMAIL_LOGIN' && (
                                <EmailLoginView
                                    email={email}
                                    setEmail={setEmail}
                                    pass={password}
                                    setPass={setPassword}
                                    onLogin={() => router.replace('/(app)')}
                                    onSignUpPress={() => transitionTo('SIGN_UP')}
                                    onForgotPasswordPress={() => transitionTo('FORGOT_PASSWORD')} // חיבור שחזור סיסמה
                                />
                            )}

                            {currentView === 'SIGN_UP' && (
                                <SignUpView
                                    onLoginPress={() => transitionTo('EMAIL_LOGIN')}
                                    onSignUp={() => router.replace('/(app)')}
                                />
                            )}

                            {/* רינדור מותנה למסך שחזור סיסמה */}
                            {currentView === 'FORGOT_PASSWORD' && (
                                <ForgotPasswordView
                                    email={email}
                                    setEmail={setEmail}
                                    onResetPress={() => {
                                        console.log("Reset sent to:", email);
                                        transitionTo('EMAIL_LOGIN');
                                    }}
                                    onBackToLogin={() => transitionTo('EMAIL_LOGIN')}
                                />
                            )}

                            <View className="mt-12 px-8">
                                <Text className="text-white/40 text-[10px] text-center leading-4 tracking-wide">
                                    By continuing, you agree to Kamino's
                                    <Text className="text-white/70 font-bold underline"> Terms </Text> &
                                    <Text className="text-white/70 font-bold underline"> Privacy Policy</Text>.
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}