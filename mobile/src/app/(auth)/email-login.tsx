import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Animated, StyleSheet, StatusBar, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, Lock } from 'lucide-react-native';

const { height } = Dimensions.get('window');

// אותם רקעים בדיוק ממסך הלוגין הראשי
const backgroundImages = [
    { uri: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2144' },
    { uri: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=2156' },
    { uri: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070' }
];

export default function EmailLoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // מנגנון האנימציה המועתק להמשכיות מושלמת
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const timer = setInterval(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 2000,
                useNativeDriver: true,
            }).start(() => {
                setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }).start();
            });
        }, 7000);

        return () => clearInterval(timer);
    }, []);

    return (
        <View className="flex-1 bg-black">
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* הרקע המונפש הזהה */}
            <Animated.Image
                source={backgroundImages[currentImageIndex]}
                style={{ opacity: fadeAnim, ...StyleSheet.absoluteFillObject }}
                resizeMode="cover"
            />
            <View className="absolute inset-0 bg-black/40" />

            <SafeAreaView className="flex-1" edges={['top']}>
                {/* כפתור חזרה עדין */}
                <View className="px-6 pt-2">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-black/20 rounded-full items-center justify-center border border-white/10"
                    >
                        <ChevronLeft color="white" size={20} />
                    </TouchableOpacity>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 justify-end"
                >
                    {/* הפאנל המודאלי */}
                    <View className="bg-black/45 px-10 pt-12 pb-20 rounded-t-[50px]">

                        <View className="mb-10 items-center">
                            <Text className="text-white text-3xl font-black italic tracking-widest uppercase text-center">
                                Sign In
                            </Text>
                            <View className="h-[1px] w-8 bg-white/20 mt-3" />
                        </View>

                        <View className="gap-y-4">
                            <View className="bg-white/10 border border-white/20 rounded-2xl h-16 flex-row items-center px-5">
                                <Mail color="rgba(255,255,255,0.4)" size={18} />
                                <TextInput
                                    className="flex-1 ml-4 text-white font-medium"
                                    placeholder="Email Address"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>

                            <View className="bg-white/10 border border-white/20 rounded-2xl h-16 flex-row items-center px-5">
                                <Lock color="rgba(255,255,255,0.4)" size={18} />
                                <TextInput
                                    className="flex-1 ml-4 text-white font-medium"
                                    placeholder="Password"
                                    placeholderTextColor="rgba(255,255,255,0.2)"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                />
                            </View>

                            <TouchableOpacity className="self-end py-1">
                                <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                                    Forgot Password?
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={() => router.replace('/(app)')}
                            className="bg-kamino-violet h-16 rounded-2xl items-center justify-center mt-8"
                        >
                            <Text className="text-white font-black text-lg uppercase tracking-[2px]">
                                Sign In
                            </Text>
                        </TouchableOpacity>

                        <View className="flex-row justify-center mt-10">
                            <Text className="text-white/30 text-[11px] font-medium tracking-wide">
                                NEW TO KAMINO?
                            </Text>
                            <TouchableOpacity onPress={() => {/* ניווט להרשמה */ }}>
                                <Text className="text-white/70 text-[11px] font-bold ml-1 border-b border-white/30">
                                    CREATE ACCOUNT
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}