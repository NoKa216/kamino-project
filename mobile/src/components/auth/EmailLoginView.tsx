import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Mail, Lock } from 'lucide-react-native';

interface Props {
    email: string;
    setEmail: (val: string) => void;
    pass: string;
    setPass: (val: string) => void;
    onLogin: () => void;
    onSignUpPress: () => void;
    onForgotPasswordPress: () => void; // הוספת הפרופ החדש לניווט הפנימי
}

export const EmailLoginView = ({
    email,
    setEmail,
    pass,
    setPass,
    onLogin,
    onSignUpPress,
    onForgotPasswordPress
}: Props) => (
    <>
        <View className="items-center mb-8">
            <Text className="text-white text-3xl font-black italic tracking-widest uppercase text-center">
                Sign In
            </Text>
            <View className="h-[1px] w-8 bg-white/20 mt-2" />
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
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <View className="bg-white/10 border border-white/20 rounded-2xl h-16 flex-row items-center px-5">
                <Lock color="rgba(255,255,255,0.4)" size={18} />
                <TextInput
                    className="flex-1 ml-4 text-white font-medium"
                    placeholder="Password"
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    secureTextEntry
                    value={pass}
                    onChangeText={setPass}
                />
            </View>

            {/* חיבור הכפתור למעבר למסך שחזור סיסמה */}
            <TouchableOpacity
                className="self-end py-1"
                onPress={onForgotPasswordPress}
            >
                <Text className="text-white/40 text-[10px] font-bold uppercase tracking-widest">
                    Forgot Password?
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={onLogin}
                className="bg-kamino-violet h-16 rounded-2xl items-center justify-center mt-4"
            >
                <Text className="text-white font-black text-lg uppercase tracking-[2px]">Sign In</Text>
            </TouchableOpacity>
        </View>

        <View className="flex-row justify-center mt-10">
            <Text className="text-white/30 text-[11px] font-medium tracking-wide">
                NEW TO KAMINO?
            </Text>
            <TouchableOpacity onPress={onSignUpPress}>
                <Text className="text-white/70 text-[11px] font-bold ml-1 border-b border-white/30">
                    CREATE ACCOUNT
                </Text>
            </TouchableOpacity>
        </View>
    </>
);